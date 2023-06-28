# Use a base Node.js image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application files
COPY . .

# Expose the API Port
EXPOSE 5000

# Set the command to run the Load Balancer
CMD ["npm", "run", "lb"]