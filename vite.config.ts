import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'song-directory-api',
      configureServer(server) {
        server.middlewares.use('/api/list-song-directories', (req, res) => {
          try {
            const songsDir = resolve(__dirname, 'songs');
            const directories = fs.readdirSync(songsDir)
              .filter(item => fs.statSync(path.join(songsDir, item)).isDirectory())
              .filter(dir => !dir.startsWith('.'));
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(directories));
          } catch (error) {
            console.error('Error listing song directories:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to list song directories' }));
          }
        });

        server.middlewares.use('/api/update-songs', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', () => {
            try {
              const songs = JSON.parse(body);
              const songsPath = resolve(__dirname, 'songs/songs.json');
              fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              console.error('Error updating songs.json:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to update songs.json' }));
            }
          });
        });
      }
    }
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  publicDir: 'songs',
});
