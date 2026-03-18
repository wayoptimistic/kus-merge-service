FROM node:18

# Install system dependencies (CRITICAL for HTTPS + ffmpeg)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    ca-certificates \
    curl \
    && update-ca-certificates

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
