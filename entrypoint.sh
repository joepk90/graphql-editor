#!/bin/sh

# Inject runtime config (to set the VITE_API_URL value at run time)
cat <<EOF > /app/dist/env.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_URL: "${VITE_API_URL}"
};
EOF

# Start the app
exec serve -s dist -p 8080