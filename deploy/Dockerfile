FROM node:22-alpine AS ui-builder
WORKDIR /app
COPY /ui/package*.json ./
RUN npm ci
COPY /ui .
RUN npm run build

FROM golang:1.25-alpine AS api-builder
WORKDIR /app
COPY /api/go.mod /api/go.sum ./
RUN go mod download
COPY /api .
COPY --from=ui-builder /app/dist ./server/ui/dist
RUN go build -tags production -o animap.bin

FROM alpine:latest
WORKDIR /app
COPY --from=api-builder /app/animap.bin .
EXPOSE 8080
CMD ["./animap.bin"]
