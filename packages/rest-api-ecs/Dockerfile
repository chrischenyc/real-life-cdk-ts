# syntax=docker/dockerfile:1
# multiestage docker image building

FROM node:16-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY tsconfig.build.json ./tsconfig.json
COPY src src
RUN npm i
RUN npm run build

FROM node:16-alpine
WORKDIR /app
COPY package.json ./
COPY --from=builder /app/dist dist
RUN apk add --no-cache tini
RUN npm i --omit=dev
EXPOSE $PORT
RUN chown node:node .
USER node
ENTRYPOINT [ "/sbin/tini","--", "node", "dist/server.js" ]