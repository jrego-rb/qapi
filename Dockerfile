FROM node:alpine

ADD package.json /data/
ADD qapi.js /data/

WORKDIR /data/
RUN npm install

ENTRYPOINT ["node", "qapi.js"]
