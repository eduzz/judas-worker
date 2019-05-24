FROM node:12-alpine

WORKDIR /worker

RUN apk add --no-cache bash

ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /bin/

COPY package.json tsconfig.json yarn.lock /worker/

RUN set -x \
    && chmod +x /bin/wait-for-it.sh \
    && yarn

CMD ["sh","-c", "wait-for-it.sh elastic:9200 && wait-for-it.sh rabbitmq:5672 && yarn dev"]
