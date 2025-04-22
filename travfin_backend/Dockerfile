# FROM node:18

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# EXPOSE 3500

# CMD ["npx", "nodemon", "index.js"]

# Use a lightweight Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only package.json and lock file first
COPY package*.json ./

# Install all required dependencies
RUN npm install express cors dotenv cookie-parser jsonwebtoken bcryptjs nodemailer otp-generator mongoose nodemon

# Copy the rest of the application code
COPY . .

# Expose backend port
EXPOSE 3500

# Run with nodemon (for auto-restart)
CMD ["npx", "nodemon", "index.js"]
