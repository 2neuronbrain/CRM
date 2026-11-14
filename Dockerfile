# Build Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Build Production Server
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server code
COPY server/ ./server/

# Copy built client assets into place
COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 3001
WORKDIR /app/server
CMD ["node", "src/app.js"]
