FROM node:20.18.0

WORKDIR /app

RUN npm install -g pnpm

# Copy the rest of your app's source code
COPY . .

# Install dependencies
RUN pnpm install

# Expose the port the app runs on
EXPOSE 5173

CMD [ "pnpm", "run", "dev", "--host" ]
