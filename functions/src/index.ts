/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onSchedule} from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as nodemailer from "nodemailer";

// Initialize Admin SDK once. This is lightweight and can be done globally.
admin.initializeApp();

// --- LAZY INITIALIZATION ---
// We define placeholders for our service instances.
// They will be initialized only when they are first needed.
let firestore: admin.firestore.Firestore;
let storage: admin.storage.Storage;
let mailTransport: nodemailer.Transporter;

// Getter functions for lazy initialization.
// These functions ensure that we only initialize each service once.
function getFirestore() {
    if (!firestore) {
        firestore = admin.firestore();
    }
    return firestore;
}

function getStorage() {
    if (!storage) {
        storage = admin.storage();
    }
    return storage;
}

function getMailTransport() {
    if (!mailTransport) {
        mailTransport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD,
            },
        });
    }
    return mailTransport;
}
// --- END LAZY INITIALIZATION ---


// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// \`maxInstances\` option in the function\'s options, e.g.
// \`onRequest({ maxInstances: 5 }, (req, res) => { ... })\`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Define the number of days after which tracks should be deleted.
const TRACK_LIFETIME_DAYS = 30;


export const sendCommentNotification = onDocumentCreated({document: "tracks/{trackId}/comments/{commentId}", enforceAppCheck: true}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        logger.log("No data associated with the event");
        return;
    }
    const commentData = snapshot.data();
    const trackId = event.params.trackId;
    const commentAuthor = commentData.author;

    try {
        const trackRef = getFirestore().collection("tracks").doc(trackId);
        const trackDoc = await trackRef.get();

        if (!trackDoc.exists) {
            logger.error(`Track ${trackId} not found.`);
            return;
        }

        const trackData = trackDoc.data()!;
        const ownerId = trackData.userId;

        // Don\'t send notification if the owner is the one commenting
        const authorUser = await admin.auth().getUser(ownerId);
        if (commentAuthor === authorUser.displayName) {
             logger.info(`Comment author is the track owner. No notification sent for track ${trackId}.`);
             return;
        }

        const userDoc = await getFirestore().collection("users").doc(ownerId).get();
        const userData = userDoc.data();
        const notificationsEnabled = userData?.notificationsEnabled ?? true;

        if (!notificationsEnabled) {
            logger.info(`User ${ownerId} has notifications disabled. No email sent.`);
            return;
        }

        const ownerEmail = authorUser.email;

        if (!ownerEmail) {
            logger.error(`No email found for user ${ownerId}`);
            return;
        }

        const mailOptions = {
            from: "\\"TrackPolish\\" <noreply@firebase.com>",
            to: ownerEmail,
            subject: `New comment on your track "${trackData.title}"`,
            html: `
                <p>Hey ${trackData.artist || "there"},</p>
                <p>You have a new comment on your track, <strong>${trackData.title}</strong>.</p>
                <p><strong>${commentAuthor}</strong> said: <em>"${commentData.text}"</em></p>
                <p>Click <a href="https://audiomarker-nfgw.web.app/track/${trackId}">here</a> to view the comment.</p>
                <br>
                <p>Regards,</p>
                <p>The TrackPolish Team</p>
            `,
        };
        
        await getMailTransport().sendMail(mailOptions);
        logger.info(`New comment notification email sent to ${ownerEmail} for track ${trackId}`);

        // Update last commented timestamp
        await trackRef.update({
            lastCommentedAt: admin.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        logger.error("Error sending comment notification:", error);
    }
});


export const cleanupOldTracks = onSchedule("every day 00:00", async (event) => {
    logger.info("Starting scheduled track cleanup job.");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - TRACK_LIFETIME_DAYS);
    const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);

    const oldTracksQuery = getFirestore().collection("tracks")
        .where("createdAt", "<=", cutoffTimestamp);

    try {
        const snapshot = await oldTracksQuery.get();
        if (snapshot.empty) {
            logger.info("No old tracks to delete.");
            return;
        }

        const promises: Promise<any>[] = [];
        snapshot.forEach(doc => {
            const trackData = doc.data();
            logger.info(`Processing old track for deletion: ${doc.id}`);

            // 1. Delete associated file from Storage
            if (trackData.storagePath) {
                const file = getStorage().bucket().file(trackData.storagePath);
                promises.push(file.delete().catch(err => {
                    // Log error if file deletion fails, but don\'t block other deletions.
                    // This can happen if the file was already deleted manually.
                    if (err.code !== 404) {
                       logger.error(`Failed to delete file ${trackData.storagePath} for track ${doc.id}`, err);
                    }
                }));
            }

            // 2. Delete comments subcollection
            const commentsRef = doc.ref.collection("comments");
            promises.push(deleteCollection(commentsRef, 50));


            // 3. Delete the track document itself
            promises.push(doc.ref.delete());
        });

        await Promise.all(promises);
        logger.info(`Successfully deleted ${snapshot.size} old tracks and their associated data.`);

    } catch (error) {
        logger.error("Error running cleanup job:", error);
    }
});


/**
 * Deletes a collection in batches to avoid out-of-memory errors.
 * @param {FirebaseFirestore.CollectionReference} collectionRef The collection to delete.
 * @param {number} batchSize The number of documents to delete in each batch.
 */
async function deleteCollection(collectionRef: admin.firestore.CollectionReference, batchSize: number) {
    const query = collectionRef.orderBy(\'__name__\').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query: admin.firestore.Query, resolve: (value: unknown) => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        return resolve(0);
    }

    const batch = getFirestore().batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}
