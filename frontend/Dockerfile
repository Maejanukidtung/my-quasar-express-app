FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci --legacy-peer-deps
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
FROM nginx:1.27-alpine
COPY --from=builder /app/dist/spa /usr/share/nginx/html