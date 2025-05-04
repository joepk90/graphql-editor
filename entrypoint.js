import http from 'http';
import handler from 'serve-handler';
import fs from 'fs';
import path from 'path';

// TODO: could include nodeenv here and make environemnt variables from the .env file work?
// TODO setup in Typescript? THis would require configuring how Docker would run. Alternatively use ts to generate a js version?

const targetDir = 'dist'

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

// TODO make environment variable injection conditional - check if any actually exist...
console.log('✅ Environment variables injected. \n');


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
    
    return handler(request, response, {
        public: targetDir,
        cleanUrls: true,
        rewrites: [
        { source: '**', destination: '/index.html' }, // rewrite everything else to root
        
        ],
    });
});

const PORT = process.env.PORT || 5173;
server.listen(PORT, () => {
  console.log(`🚀 Editor is running at http://localhost:${PORT}`);
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