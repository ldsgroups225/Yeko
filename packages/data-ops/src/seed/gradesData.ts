import { GradeData } from "../drizzle/core-schema";

export const gradesData = (generalTrackId: string): GradeData[] => [
  { name: "6ème", code: "6EME", order: 1, trackId: generalTrackId },
  { name: "5ème", code: "5EME", order: 2, trackId: generalTrackId },
  { name: "4ème", code: "4EME", order: 3, trackId: generalTrackId },
  { name: "3ème", code: "3EME", order: 4, trackId: generalTrackId },
  { name: "2nde", code: "2NDE", order: 5, trackId: generalTrackId },
  { name: "1ère", code: "1ERE", order: 6, trackId: generalTrackId },
  { name: "Terminale", code: "TERM", order: 7, trackId: generalTrackId },
];
