FROM node:24-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js .

FROM gcr.io/distroless/nodejs24-debian13

WORKDIR /app
COPY --from=build /app /app

USER nonroot

EXPOSE 3000

CMD ["server.js"]
