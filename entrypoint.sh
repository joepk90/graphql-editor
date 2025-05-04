#!/bin/sh

PORT=${CLIENT_PORT:-5173}

# alternative approach theentrypoint.js setup for handling runtime env vars

# Inject runtime config (to set the VITE_API_URL value at run time)
sed -i "s|__VITE_API_URL__|$VITE_API_URL|g" ./dist/env.runtime.js

# Start the app
exec serve -s dist -p $PORT --no-clipboard
