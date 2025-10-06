# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# Only prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built dist and necessary assets
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src

# Ensure uploads directory exists (mounted in compose)
RUN mkdir -p /app/uploads/avatars && mkdir -p /app/uploads

EXPOSE 3000
CMD ["node", "dist/main.js"]
