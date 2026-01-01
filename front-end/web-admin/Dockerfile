FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies (including devDependencies for build if needed, or production only)
RUN npm install

COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application in dev mode for local
CMD ["npm", "run", "dev"]
