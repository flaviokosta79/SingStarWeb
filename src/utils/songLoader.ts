import { Song, LyricLine } from '../types/song';
import { v4 as uuidv4 } from 'uuid';

/**
 * Loads songs by scanning the songs directory automatically
 * @returns Promise<Song[]> A promise that resolves to an array of Song objects
 */
export async function loadSongsFromFileSystem(): Promise<Song[]> {
  try {
    // First try to load existing songs.json for backward compatibility
    let existingSongs: Song[] = [];
    try {
      const response = await fetch('/songs/songs.json');
      if (response.ok) {
        existingSongs = await response.json();
        console.log('Loaded existing songs from songs.json:', existingSongs);
      }
    } catch (error) {
      console.warn('Could not load existing songs.json, will scan directories instead:', error);
    }

    // Scan the songs directory to find all song folders
    const songs = await scanSongsDirectory(existingSongs);
    
    console.log('Loaded songs from directory scan:', songs);
    return songs;
  } catch (error) {
    console.error('Error loading songs:', error);
    throw new Error(`Failed to load songs: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Scans the songs directory to find all song folders and extract metadata
 * @param existingSongs Existing songs from songs.json if available
 * @returns Promise<Song[]> Array of songs
 */
async function scanSongsDirectory(existingSongs: Song[] = []): Promise<Song[]> {
  try {
    // In a browser environment, we can't directly scan directories
    // Instead, we'll use a combination of approaches to simulate directory scanning:
    
    // 1. Try to fetch a directory listing (this might require server-side help)
    // 2. Use known patterns to discover songs based on folder naming conventions
    
    // Approach: Fetch a dynamically generated directory listing
    // This requires a small server-side script or endpoint to list directories
    let songDirectories: string[] = [];
    
    try {
      const response = await fetch('/api/list-song-directories');
      if (response.ok) {
        songDirectories = await response.json();
      } else {
        throw new Error('Directory listing API not available');
      }
    } catch (directoryListError) {
      console.warn('Could not get directory listing via API, falling back to manual discovery');
      
      // Fallback: Try to discover songs by checking for known folders
      songDirectories = await discoverSongDirectories();
    }
    
    // Process each song directory
    const songPromises = songDirectories.map(dirName => processSongDirectory(dirName, existingSongs));
    const songs = await Promise.all(songPromises);
    
    // Filter out any null results from processing failures
    return songs.filter((song): song is Song => song !== null);
  } catch (error) {
    console.error('Error scanning songs directory:', error);
    // If all else fails, return existing songs
    return existingSongs;
  }
}

/**
 * Discovers song directories by testing for the existence of files in predictable locations
 * @returns Promise<string[]> Array of directory names
 */
async function discoverSongDirectories(): Promise<string[]> {
  try {
    // First, let's try to fetch the actual songs folder content
    // This is a more modern approach that might be supported by some servers
    try {
      const response = await fetch('/songs/?list');
      if (response.ok) {
        const html = await response.text();
        const markerType = '-'; // Temporary placeholder until we get actual marker
const isPause = markerType === '-';
        const isProlongation = markerType === '~';
        // Extract directory names from directory listing (simple parsing)
        const dirRegex = /<a[^>]*href="([^"]+\/)"/g;
        const dirs: string[] = [];
        let match;
        while ((match = dirRegex.exec(html)) !== null) {
          if (match[1] !== '../') {  // Skip parent directory
            dirs.push(match[1].replace('/', ''));
          }
        }
        
        if (dirs.length > 0) {
          return dirs;
        }
      }
    } catch (listingError) {
      console.warn('Could not fetch directory listing:', listingError);
    }
    
    // Fallback: Check if we can get an index of the songs directory
    // This requires the server to generate directory listings
    
    // If we can't get a directory listing, we'll try a different approach:
    // We'll scan existing songs.json to identify which folders we already know about
    const knownDirs = new Set<string>();
    existingSongs.forEach(song => {
      if (song.videoUrl) {
        const parts = song.videoUrl.split('/');
        if (parts.length >= 3) {
          // Extract the directory name from paths like "/songs/Dir Name/file.mp4"
          knownDirs.add(parts.slice(1, -1).join('/'));
        }
      }
    });
    
    return Array.from(knownDirs);
  } catch (error) {
    console.error('Error discovering song directories:', error);
    return [];
  }
}

/**
 * Processes a song directory to extract metadata
 * @param dirName Directory name (e.g. "a-ha - Take on me")
 * @param existingSongs Existing songs to check against
 * @returns Promise<Song | null> A song object or null if processing fails
 */
async function processSongDirectory(dirName: string, existingSongs: Song[]): Promise<Song | null> {
  try {
    // Check if this song already exists in our data
    const existingSong = existingSongs.find(song => 
      song.videoUrl?.includes(dirName) || song.albumCover?.includes(dirName)
    );
    
    if (existingSong) {
      console.log(`Song already exists in database: ${dirName}`);
      return existingSong;
    }
    
    // Extract artist and title from the directory name (assumed format: "Artist - Title")
    const parts = dirName.split(' - ');
    let artist = 'Unknown Artist';
    let title = 'Unknown Title';
    
    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts[1].trim();
    }
    
    // Construct paths for files we expect to find
    const basePath = `/songs/${dirName}`;
    const coverPath = `${basePath}/${dirName}.jpg`;
    const videoPath = `${basePath}/${dirName}.mp4`;
    const musicPath = `${basePath}/${dirName} [music].mp3`;
    const vocalsPath = `${basePath}/${dirName} [vocals].mp3`;
    const lyricsPath = `${basePath}/${dirName}.txt`;
    
    // Check which files actually exist by trying to fetch them
    // We'll start with the cover image which should always exist
    let coverExists = false;
    
    try {
      const coverResponse = await fetch(coverPath, { method: 'HEAD' });
      coverExists = coverResponse.ok;
    } catch (e) {
      console.warn(`Cover image not found for ${dirName}`);
    }
    
    // If we don't even have a cover image, we might not have a valid song folder
    if (!coverExists) {
      console.warn(`Skipping invalid song directory: ${dirName}`);
      return null;
    }
    
    // Create a new song entry
    const newSong: Song = {
      id: uuidv4(),
      title,
      artist,
      year: new Date().getFullYear(), // Default to current year if unknown
      albumCover: coverPath,
      videoUrl: videoPath,
      musicUrl: musicPath,
      vocalsUrl: vocalsPath,
      lyrics: [] // We'll load lyrics separately if needed
    };
    
    // If lyrics file exists, try to parse it
    try {
      const lyricsResponse = await fetch(lyricsPath);
      if (lyricsResponse.ok) {
        const lyricsText = await lyricsResponse.text();
        newSong.lyrics = parseLyricsFromText(lyricsText);
      }
    } catch (e) {
      console.warn(`Lyrics not found or could not be parsed for ${dirName}`);
    }
    
    return newSong;
  } catch (error) {
    console.error(`Error processing song directory ${dirName}:`, error);
    return null;
  }
}

/**
 * Parse lyrics from text content
 * @param text Lyrics text content
 * @returns Array of LyricLine objects
 */
function parseLyricsFromText(text: string): LyricLine[] {
  const lyrics: LyricLine[] = [];
  const lines = text.split('\n');
  let bpm = 160; // Default BPM
  let gap = 0; // Default GAP in milliseconds
  let videoGap = 0; // Default VIDEOGAP in milliseconds

  // First pass: extract BPM, GAP and VIDEOGAP from header
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('#BPM:')) {
      // Handle European decimal notation (comma instead of period)
      const bpmValue = trimmedLine.split(':')[1].trim().replace(',', '.');
      bpm = parseFloat(bpmValue);
    } else if (trimmedLine.startsWith('#GAP:')) {
      // Handle European decimal notation (comma instead of period)
      const gapValue = trimmedLine.split(':')[1].trim().replace(',', '.');
      gap = parseFloat(gapValue);
    } else if (trimmedLine.startsWith('#VIDEOGAP:')) {
      // Handle European decimal notation (comma instead of period)
      const videoGapValue = trimmedLine.split(':')[1].trim().replace(',', '.');
      videoGap = parseFloat(videoGapValue) * 1000; // Convert to milliseconds
    }
  }

  // Convert beat to milliseconds function
  const beatToMs = (beat: number): number => {
    // Calculate the time in milliseconds, accounting for both GAP and VIDEOGAP
    // GAP is the delay before the song starts
    // VIDEOGAP is the offset between audio and video
    return gap + (beat * 60000) / bpm - videoGap;
  };

  // Second pass: parse lyrics
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^[:*~\-]/)) {
      const markerType = trimmedLine[0];
      const isGolden = markerType === '*';
      const isPause = markerType === '-';
      const isProlongation = markerType === '~';
      const parts = trimmedLine.slice(1).trim().split(' ');

      if (parts.length >= 4) {
        const startBeat = parseInt(parts[0], 10);
        const lengthBeat = parseInt(parts[1], 10);
        const startTime = beatToMs(startBeat);
        const endTime = beatToMs(startBeat + lengthBeat);
        const text = parts.slice(3).join(' ');

        lyrics.push({
          startTime,
          endTime,
          text,
          isPause,
          isProlongation,
          isGolden
        });
      }
    }
  }
  
  return lyrics;
}

/**
 * Saves the songs data back to the server
 * This would require a server endpoint to handle the update
 * @param songs Array of songs to save
 */
export async function saveSongsData(songs: Song[]): Promise<void> {
  try {
    // This function would need a server endpoint to work
    // For a pure frontend solution, you might want to use localStorage instead
    const response = await fetch('/api/update-songs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(songs)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save songs data: ${response.statusText}`);
    }
    
    console.log('Songs data saved successfully');
  } catch (error) {
    console.error('Error saving songs data:', error);
    throw error;
  }
}