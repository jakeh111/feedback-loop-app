// In a real-world application, this file would contain functions to fetch data from a database or an external API.
// For this prototype, we'll simulate that data fetching with a delay.

export type DashboardTrack = {
  id: string;
  title: string;
  comments: number;
  date: string;
};

// This is the mock data that used to be in the dashboard page component.
const mockTracks: DashboardTrack[] = [
  { id: "a1b2c3d4", title: "Sunset Groove", comments: 5, date: "2024-05-10" },
  { id: "e5f6g7h8", title: "Midnight Mix v3", comments: 12, date: "2024-05-08" },
  { id: "i9j0k1l2", title: "Vocal Takes - Final", comments: 8, date: "2024-05-05" },
  { id: "m3n4o5p6", title: "Acoustic Demo", comments: 2, date: "2024-05-02" },
];

/**
 * Fetches the tracks for the main dashboard view.
 * In a real app, this would fetch data for the currently logged-in user.
 */
export const getDashboardTracks = async (): Promise<DashboardTrack[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // To test the empty state, you can return an empty array:
  // return [];

  return mockTracks;
};
