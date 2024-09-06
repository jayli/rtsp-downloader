# 使用官方Node.js运行时作为父镜像
FROM node:14

RUN apt-get update && apt-get install -y ffmpeg
 
# 设置工作目录
WORKDIR /app
 
# 复制package.json文件和package-lock.json文件（如果存在）
COPY package.json ./

COPY . ./
 
# 安装项目依赖
RUN npm install --registry=https://registry.npmmirror.com
 

ENV PATH=$PATH:/usr/bin/ffmpeg
 
# 暴露容器端口
EXPOSE 3000
 
# 运行npm start命令
CMD ["npm", "start"]
