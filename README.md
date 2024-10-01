# Bolt
Welcome to the **Bolt** open-source repository! This repo provides everything you need to start building **AI-powered software development tools** powered by StackBlitz’s **WebContainer API**. 

### Why Build with Bolt + WebContainer API
By building with the Bolt + WebContainer API you can create browser-based applications that let users **prompt, run, edit, and deploy** full-stack web apps directly in the browser, without the need for virtual machines. With WebContainer API, you can build apps that give AI direct access and full control over a **Node.js server**, **filesystem**, **package manager** and **dev terminal** inside your users browser tab. This powerful combination allows you to create a new class of development tools that support all major javascript libraries and node packages right out of the box, all without remote environments or local installs.


### What’s the Difference Between Bolt (This Repo) and [Bolt.new](https://bolt.new)?

- **Bolt.new**: This is the **commercial product** from StackBlitz—a hosted, browser-based AI development tool that enables users to prompt, run, edit, and deploy full-stack web applications directly in the browser. Built on top of the [Bolt open-source repo](https://github.com/stackblitz/bolt) and powered by the StackBlitz **WebContainer API**, it offers non-technical users the ability to create production-grade apps using AI.

- **Bolt (This Repo)**: This open-source repository provides the building blocks behind **Bolt.new**. This package contains the UI interface for Bolt as well as the server components, built using [Remix Run](https://remix.run/). By leveraging this repo and StackBlitz’s **WebContainer API**, you can create your own AI-powered development tools and full-stack applications that run entirely in the browser. This code allows you to customize and expand use cases, integrating AI and WebContainers into your own unique applications.

The [WebContainer API](https://webcontainers.io) is free for personal and open source usage. If you're building an application for commercial usage, you can learn more about our [WebContainer API commercial usage pricing here](https://stackblitz.com/pricing#webcontainer-api).

# Get Started Building with Bolt

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v20.15.1)
- pnpm (v9.4.0)

## Setup

1. Clone the repository (if you haven't already):

```bash
git clone https://github.com/stackblitz/bolt.new.git
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file in the root directory and add your Anthropic API key:

```
ANTHROPIC_API_KEY=XXX
```

Optionally, you an set the debug level:

```
VITE_LOG_LEVEL=debug
```

**Important**: Never commit your `.env.local` file to version control. It's already included in .gitignore.

## Available Scripts

- `pnpm run dev`: Starts the development server.
- `pnpm run build`: Builds the project.
- `pnpm run start`: Runs the built application locally using Wrangler Pages. This script uses `bindings.sh` to set up necessary bindings so you don't have to duplicate environment variables.
- `pnpm run preview`: Builds the project and then starts it locally, useful for testing the production build. Note, HTTP streaming currently doesn't work as expected with `wrangler pages dev`.
- `pnpm test:` Runs the test suite using Vitest.
- `pnpm run typecheck`: Runs TypeScript type checking.
- `pnpm run typegen`: Generates TypeScript types using Wrangler.
- `pnpm run deploy`: Builds the project and deploys it to Cloudflare Pages.

## Development

To start the development server:

```bash
pnpm run dev
```

This will start the Remix Vite development server.

## Testing

Run the test suite with:

```bash
pnpm test
```

## Deployment

To deploy the application to Cloudflare Pages:

```bash
pnpm run deploy
```

Make sure you have the necessary permissions and Wrangler is correctly configured for your Cloudflare account.
