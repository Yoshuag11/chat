FROM node

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

COPY yarn.lock ./

USER node

RUN yarn install

COPY --chown=node:node . .

EXPOSE 3002

CMD [ "node", "index.js" ]