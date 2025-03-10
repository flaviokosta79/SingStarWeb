import { Song, LyricLine } from '../types/song';
import { v4 as uuidv4 } from 'uuid';

/**
 * Loads songs from the songs.json file
 * @returns Promise<Song[]> A promise that resolves to an array of Song objects
 */
export async function loadSongsFromFileSystem(): Promise<Song[]> {
  try {
    // In a browser environment, we can't use fs directly
    // Instead, we'll fetch the songs.json file
    const response = await fetch('/songs/songs.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch songs: ${response.statusText}`);
    }
    
    const songsData = await response.json();
    
    // Transform the data to match our Song interface
    const songs: Song[] = songsData.map((songData: any) => {
      // Extract the directory name from the videoUrl or cover path
      let dirName = '';
      if (songData.videoUrl) {
        dirName = songData.videoUrl.split('/').slice(0, -1).join('/');
      } else if (songData.cover && songData.cover !== '/songs/covers/default.jpg') {
        dirName = songData.cover.split('/').slice(0, -1).join('/');
      }
      
      // Construct paths for music and vocals files based on naming convention
      let musicUrl = '';
      let vocalsUrl = '';
      
      if (dirName) {
        // If we have a directory, look for music and vocals files
        const baseName = `${songData.artist} - ${songData.title}`;
        musicUrl = `${dirName}/${baseName} [music].mp3`;
        vocalsUrl = `${dirName}/${baseName} [vocals].mp3`;
      } else if (songData.audioPath) {
        // If we have an audioPath, use it for musicUrl
        musicUrl = songData.audioPath;
      }
      
      return {
        id: songData.id || uuidv4(),
        title: songData.title || 'Unknown Title',
        artist: songData.artist || 'Unknown Artist',
        year: songData.year || new Date().getFullYear(),
        albumCover: songData.cover || '/songs/covers/default.jpg',
        videoUrl: songData.videoUrl || '',
        musicUrl: musicUrl,
        vocalsUrl: vocalsUrl,
        lyrics: songData.lyrics || []
      };
    });
    
    console.log('Loaded songs from songs.json:', songs);
    return songs;
  } catch (error) {
    console.error('Error loading songs:', error);
    throw new Error(`Failed to load songs: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parses a song file and extracts metadata and lyrics
 * @param filePath Path to the song text file
 * @param songDirPath Path to the song directory
 * @returns A Song object with metadata and lyrics
 */
async function parseSongFile(filePath: string, songDirPath: string): Promise<Song> {
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    
    // Extract metadata from the file
    const metadata: Record<string, string> = {};
    const lyrics: LyricLine[] = [];
    
    // Process metadata lines (lines starting with #)
    for (const line of lines) {
      if (line.startsWith('#')) {
        const [key, value] = line.substring(1).split(':', 2);
        if (key && value) {
          metadata[key.trim()] = value.trim();
        }
      } else if (line.startsWith(':')) {
        // Process lyric lines (lines starting with :)
        // Format: : startTime duration pitch text
        const parts = line.substring(1).trim().split(' ');
        if (parts.length >= 4) {
          const startTime = parseInt(parts[0], 10);
          const duration = parseInt(parts[1], 10);
          // Calculate end time based on start time and duration
          const endTime = startTime + duration;
          // Join the remaining parts as the lyric text
          const text = parts.slice(3).join(' ');
          
          lyrics.push({
            startTime,
            endTime,
            text
          });
        }
      }
    }
    
    // Get the song directory name to extract artist and title if not in metadata
    const dirName = path.basename(songDirPath);
    let artist = metadata.ARTIST;
    let title = metadata.TITLE;
    
    // If artist and title are not in metadata, try to extract from directory name
    if (!artist || !title) {
      const parts = dirName.split(' - ');
      if (parts.length >= 2) {
        artist = artist || parts[0];
        title = title || parts[1];
      }
    }
    
    // Construct file paths for cover, audio, and video
    const coverPath = metadata.COVER ? 
      `/songs/${dirName}/${metadata.COVER}` : 
      '/songs/covers/default.jpg';
      
    const videoPath = metadata.VIDEO ? 
      `/songs/${dirName}/${metadata.VIDEO}` : 
      '';
    
    // Create and return the Song object
    return {
      id: uuidv4(),
      title: title || 'Unknown Title',
      artist: artist || 'Unknown Artist',
      year: metadata.YEAR ? parseInt(metadata.YEAR, 10) : new Date().getFullYear(),
      albumCover: coverPath,
      videoUrl: videoPath,
      lyrics: lyrics
    };
  } catch (error) {
    console.error('Error parsing song file:', error);
    throw error;
  }
}

/**
 * Parses lyrics from a file path or returns an empty array if the file doesn't exist
 * @param lyricsPath Path to the lyrics file
 * @returns Array of LyricLine objects
 */
function parseLyrics(lyricsPath?: string): LyricLine[] {
  if (!lyricsPath) return [];
  
  try {
    // This is a placeholder. In a real implementation, you would:
    // 1. Read the lyrics file
    // 2. Parse the content based on your lyrics format
    // 3. Return an array of LyricLine objects
    
    // For now, we'll return an empty array
    return [];
  } catch (error) {
    console.error('Error parsing lyrics:', error);
    return [];
  }
}