# 使用官方Node.js运行时作为父镜像
FROM node:14.21.3
 
# 设置工作目录
WORKDIR /usr/src/app
 
# 复制package.json文件和package-lock.json文件（如果存在）
COPY package.json ./
 
# 安装项目依赖
RUN npm install
 
# 复制项目文件到工作目录
COPY . .
 
# 暴露容器端口
EXPOSE 3000
 
# 运行npm start命令
CMD ["npm", "start"]
