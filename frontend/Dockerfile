FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci --legacy-peer-deps
RUN npm run build
FROM nginx:1.27-alpine
COPY --from=builder /app/dist/spa /usr/share/nginx/html