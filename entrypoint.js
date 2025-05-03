import http from 'http';
import handler from 'serve-handler';
import fs from 'fs';
import path from 'path';

// TODO: could include nodeenv here and make environemnt variables from the .env file work?

const targetDir = process.argv[2] || 'dist'; // default to 'dist' if not provided
if (process.argv[2]) {
    console.log(`📁 Serving file from the ${process.argv[2]} directory... \n`)
}

// Inject env variables (like before)
const envFilePath = path.resolve(targetDir, 'env.runtime.js');
let envContent = fs.readFileSync(envFilePath, 'utf-8');

const replacements = {
  '__VITE_API_URL__': process.env.VITE_API_URL || '',
};

for (const [key, value] of Object.entries(replacements)) {
  envContent = envContent.split(key).join(value);
}
fs.writeFileSync(envFilePath, envContent);
console.log('✅ Environment variables injected.');

const getIgnoredPaths = () => {
    const raw = process.env.IGNORE_PATHS;
  
    if (!raw) return [];
  
    const ignoredPathArray = raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean); // removes empty strings
  
    return ignoredPathArray.map((path) => ({ source: path }));

     // { source: '/ignore-this-path', destination: '/404.html' }
  };


// Start custom static server
const server = http.createServer((request, response) => {
    const start = Date.now();
    
    // Capture the response finish event to log the status code and duration
    response.on('finish', () => {
        const duration = Date.now() - start;
        console.log(
        `${request.method} ${request.url} → ${response.statusCode} [${duration}ms]`
        );
    });
    
    const ignoredPaths = getIgnoredPaths()

    return handler(request, response, {
        public: targetDir,
        cleanUrls: true,
        rewrites: [
            ...ignoredPaths,
        { source: '**', destination: '/index.html' }, // rewrite everything else to root
        
        ],
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});



// ✅ Gracefully shut down on SIGINT or SIGTERM
const shutdown = () => {
    console.log('\n🛑 Shutting down...');
    server.close(() => {
      console.log('✅ Server closed.');
      process.exit(0);
    });
  };
  
  process.on('SIGINT', shutdown);  // Ctrl+C or Docker stop
  process.on('SIGTERM', shutdown); // Docker stop