# travfin_frontend/Dockerfile

# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the frontend app
CMD ["npm", "start"]
