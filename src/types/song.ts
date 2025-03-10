export interface Song {
  id: string;
  title: string;
  artist: string;
  year: number;
  albumCover: string;
  videoUrl: string;
  musicUrl: string;
  vocalsUrl: string;
  lyrics: LyricLine[];
}

export interface LyricLine {
  startTime: number;
  endTime: number;
  text: string;
}

export interface UserScore {
  songId: string;
  score: number;
  date: string;
  userId: string;
}