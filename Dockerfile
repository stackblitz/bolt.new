FROM node:20.15.1

WORKDIR /app

# Install pnpm (matches packageManager in package.json)
RUN npm install -g pnpm@9.4.0

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Clean install dependencies with legacy peer deps
RUN rm -rf node_modules
RUN pnpm install --no-frozen-lockfile
RUN pnpm rebuild

# Copy source code
COPY . .

# Create empty .env.local if it doesn't exist
RUN touch .env.local

# Expose Vite's default port
EXPOSE 5173

# Required for WebContainer API
ENV NODE_ENV=development
ENV VITE_LOG_LEVEL=debug

# Start Vite directly instead of through Remix
CMD ["pnpm", "exec", "vite", "dev", "--host"]
