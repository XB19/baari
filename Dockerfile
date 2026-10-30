# Compilation du site React
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

# Dépendances du serveur, sans les outils de développement
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Image finale : uniquement ce qui sert à l'exécution
FROM node:24-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4000
WORKDIR /app
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY server/db.js server/index.js server/set-admin.js ./server/
COPY src/data.js ./src/data.js
RUN mkdir -p server/uploads && chown -R node:node server/uploads
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4000/api/content').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "server/index.js"]
