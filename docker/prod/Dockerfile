FROM node:12-alpine

WORKDIR /worker

COPY . /worker

RUN set -x \
    && yarn \
    && yarn tsc

FROM node:12-alpine

WORKDIR /worker

COPY package.json yarn.lock /worker/

RUN set -x \
    && yarn install --production

COPY --from=0 /worker/dist /worker/dist

CMD ["node", "/worker/dist/index.js"]