FROM node:14.21.3

WORKDIR /client

COPY package.json .
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 3000
CMD npm start