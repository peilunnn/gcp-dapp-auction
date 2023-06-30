FROM node:14.21.3

WORKDIR /backend

COPY package.json .
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 5000

ENV NODE_ENV staging
CMD ["npm", "start"]