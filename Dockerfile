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
COPY index.html ./index.html

# Build the TypeScript code
RUN npm run build


# Stage 2: Run the app
FROM node:20-slim
WORKDIR /app

# Only copy the built code and necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Add startup script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN npm install --production
RUN npm install -g serve

# Expose the port (adjust if needed)
EXPOSE 8080

# Command to run the built app
CMD ["/app/entrypoint.sh"]