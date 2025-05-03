#!/bin/sh

# replace VITE_API_URL in env.runtime.js file
sed -i 's|__VITE_API_URL__|'"$VITE_API_URL"'|g' ./dist/env.runtime.js

# Start the app (# --no-clipboard flag supress pointless error)
exec serve -s dist -p 8080 --no-clipboard