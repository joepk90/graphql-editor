import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import runtimeEnvPlugin from './vite-plugin-runtime-envs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173, // dev server port
  },
  preview: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
  plugins: [
    {
      name: 'ignore-graphiql-css-source-map',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('graphiql.css.map')) {
          server.ws.send('error', {
            message: `The source map for graphiql.css was not found.`,
          });
          return [];
        }
      },
    },
    react(),
    runtimeEnvPlugin({ publicEnvKeys: ['VITE_API_URL'] }), // env key also set in entrypoint file
  ],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'), // @ -> ./src
    },
  },
});
