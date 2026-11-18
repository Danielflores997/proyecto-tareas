FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src

USER node
# Render define PORT=10000; en Docker Compose se usa 3000.
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/health" || exit 1

CMD ["node", "src/server.js"]
