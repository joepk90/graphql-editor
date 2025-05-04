# Stage 2: Build the app
FROM node:20-slim AS builder

WORKDIR /app

# TODO resolve package-lock.json copy issue - cant copy due to platform issues (@rollup/rollup-linux-arm64-gnu)
# COPY package-lock.json ./
COPY package.json ./
RUN npm install

# COPY . .
COPY ./src ./src
COPY tsconfig.json ./tsconfig.json 
COPY tsconfig.node.json ./tsconfig.node.json 
COPY tsconfig.app.json ./tsconfig.app.json
COPY vite.config.ts ./vite.config.ts
# TODO vite-plugin-runtime-envs.ts should be turned into a vite plugin
COPY vite-plugin-runtime-envs.ts ./vite-plugin-runtime-envs.ts
COPY index.html ./index.html

# Build the TypeScript code
RUN npm run build


# Stage 2: Run the app
FROM node:20-slim

WORKDIR /app

# Only copy the built code and necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Expose the port (adjust if needed)
EXPOSE 8080

# RUN TIME ENV VARS JS/EXPRESS SETUP (entrypoint.js)
# RUN npm install --production
# COPY entrypoint.js ./entrypoint.js
# CMD ["node", "entrypoint.js"]

# RUN TIME ENV VARS BASH SETUP (entrypoint.sh)
RUN npm install -g serve
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
CMD ["npm", "run", "serve:bash"]
