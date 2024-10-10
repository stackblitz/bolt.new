FROM node:20.18.0

WORKDIR /app

RUN npm install -g pnpm

# Install dependencies (this step is cached as long as the dependencies don't change)
COPY package.json package-lock.json .
RUN pnpm install

# Copy the rest of your app's source code
COPY . .

# Expose the port the app runs on
EXPOSE 5173

CMD [ "pnpm", "run", "dev", "--host" ]
