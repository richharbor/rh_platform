FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies (including devDependencies for build if needed, or production only)
RUN npm install

COPY . .

# run the Next.js app
RUN npm run dev

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
