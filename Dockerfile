




FROM node:14 as node-base


WORKDIR /app

# # 复制package.json文件和package-lock.json文件（如果存在）
COPY package.json ./

COPY . ./


# # # 安装项目依赖
RUN npm install --registry=https://registry.npmmirror.com




#CMD ["npm", "start"]
