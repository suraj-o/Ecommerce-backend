FROM node:20 as builder

WORKDIR /build

COPY  package*.json .
RUN npm install

COPY src/ src/
COPY tsconfig.json tsconfig.json

RUN npm run build

FROM node:20 as runner

WORKDIR /app

COPY --from=builder /build/build/ /build
COPY --from=builder /build/package*json .
COPY --from=builder /build/node_modules node_modules

CMD [ "npm","start" ]