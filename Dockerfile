




FROM node:14-alpine

WORKDIR /app

COPY package.json ./

COPY . ./

RUN npm install --registry=https://registry.npmmirror.com

RUN mkdir /app/videos
RUN chmod +w /app/videos




#CMD ["npm", "start"]
