




FROM node:14-alpine

WORKDIR /app

COPY package.json ./

CMD ["npm", "run", "clear"]

COPY . ./

ENV PATH=/usr/local/bin:$PATH

RUN npm install --registry=https://registry.npmmirror.com
#RUN corepack enable && pnpm i --frozen-lockfile --registry=https://registry.npmmirror.com

#RUN mkdir /app/videos
RUN chmod +w /app/videos

RUN chmod +x /app/bin/recorder.js

#ENTRYPOINT ["/app/bin/recorder.js"]
#CMD ["npm", "start"]
