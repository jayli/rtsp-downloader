# 使用官方Node.js运行时作为父镜像
FROM node:14

# 下载 FFmpeg 源代码
# 将 FFmpeg 二进制文件复制到 Docker 镜像中
#COPY ./ffmpeg /usr/local/bin/ffmpeg
 
# 设置工作目录
WORKDIR /app
 
# 复制package.json文件和package-lock.json文件（如果存在）
COPY package.json ./

COPY . ./
 
# 安装项目依赖
RUN npm install --registry=https://registry.npmmirror.com
 

#ENV PATH=$PATH:/usr/local/bin/ffmpeg
 
# 暴露容器端口
EXPOSE 3000
 
# 运行npm start命令
CMD ["npm", "start"]
