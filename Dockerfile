FROM node:alpine

ADD package.json /data/
ADD qapi.js /data/
ADD db.json /data/

WORKDIR /data/
RUN npm install

ENTRYPOINT ["node", "qapi.js"]
