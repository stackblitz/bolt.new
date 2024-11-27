ARG BASE=node:20.18.1-bookworm-slim
FROM ${BASE} AS base

WORKDIR /app

# Install dependencies (this step is cached as long as the dependencies don't change)
COPY package.json pnpm-lock.yaml ./

RUN corepack enable pnpm && pnpm install

# Copy the rest of your app's source code
COPY . .

# Expose the port the app runs on
EXPOSE 5173

# Production image
FROM base AS bolt-ai-production

# Define environment variables with default values or let them be overridden
ARG VITE_LOG_LEVEL=debug
ARG ANTHROPIC_API_KEY

ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY} \
    VITE_LOG_LEVEL=${VITE_LOG_LEVEL} 

# Pre-configure wrangler to disable metrics
RUN mkdir -p /root/.config/.wrangler && \
    echo '{"enabled":false}' > /root/.config/.wrangler/metrics.json

RUN npm run build

CMD [ "pnpm", "run", "dockerstart"]

# Development image
FROM base AS bolt-ai-development

# Define the same environment variables for development
ARG VITE_LOG_LEVEL=debug
ARG ANTHROPIC_API_KEY

ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY} \
    VITE_LOG_LEVEL=${VITE_LOG_LEVEL} 

RUN mkdir -p ${WORKDIR}/run
CMD pnpm run dev --host