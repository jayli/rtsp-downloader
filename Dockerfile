




FROM node:14-alpine

WORKDIR /app

COPY package.json ./

COPY . ./

#COPY qemu-arm-static /usr/bin/qemu-arm-static

ENV PATH=/usr/local/bin:$PATH

RUN npm install --registry=https://registry.npmmirror.com
# RUN corepack enable && pnpm i --frozen-lockfile --registry=https://registry.npmmirror.com

RUN mkdir /app/videos
RUN chmod +w /app/videos




#CMD ["npm", "start"]
