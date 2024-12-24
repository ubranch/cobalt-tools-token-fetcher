# Use Node.js base image
FROM node:20-slim

# Install required dependencies for Puppeteer and other tools
RUN apt-get update && apt-get install -y \
    chromium \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libpango-1.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    libxcb-dri3-0 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*


# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Set environment variables
ENV PORT=3000
ENV HOST=0.0.0.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
