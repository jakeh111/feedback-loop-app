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

// Initialize Firebase Admin SDK
admin.initializeApp();
const firestore = admin.firestore();
const storage = admin.storage();


// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Define the number of days after which tracks should be deleted.
const TRACK_LIFETIME_DAYS = 30;

export const cleanupOldTracks = onSchedule("every day 00:00", async (event) => {
    logger.info("Starting scheduled track cleanup job.");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - TRACK_LIFETIME_DAYS);
    const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);

    const oldTracksQuery = firestore.collection("tracks")
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
                const file = storage.bucket().file(trackData.storagePath);
                promises.push(file.delete().catch(err => {
                    // Log error if file deletion fails, but don't block other deletions.
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
async function deleteCollection(collectionRef: FirebaseFirestore.CollectionReference, batchSize: number) {
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: (value: unknown) => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        return resolve(0);
    }

    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}
