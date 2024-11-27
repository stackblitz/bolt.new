# Use an official Node.js runtime as the base image
FROM node:20.15.1

# Set the working directory in the container
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.4.0

# Copy package.json and pnpm-lock.yaml (if available)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 5173

# Start the application
CMD ["pnpm", "run", "dev"]