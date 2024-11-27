[![Bolt: AI-Powered Full-Stack Web Development in the Browser](./public/social_preview_index.jpg)](https://bolt.new)

# Bolt Community Edition

What makes this differnt and why did we create this fork.

We created this fork, since the original bolt repo was not being actively developed due to them working on their commercial edition. This edition will more closely follow there commerical repo, but allow for more frequent updates and community involvement


## Community
Discord - https://discord.gg/t9b6Npje

## Getting Started
To get started with Bolt Community Edition, just fork this and use npm or docker compose. More information comming soon.

Many of you are new users to installing software from Github. Here are a few links that will be helpfull in

1. Clone the repository (if you haven't already) by opening a Terminal window (or CMD with admin permissions) and then typing in this:

```
git clone https://github.com/Bolt-CE/bolt.git
```

2. Rename .env.example to .env.local and add your LLM API key. 

3. Run Bolt using one of the 3 following ways:

If you can't see the file indicated above, its likely you can't view hidden files. On Mac, open a Terminal window and enter this command below. On Windows, you will see the hidden files option in File Explorer Settings. A quick Google search will help you if you are stuck here.

4a. Direct Docker Build Commands

You can use Docker's target feature to specify the build environment instead of using NPM scripts if you wish:

```bash
# Development build
docker build . --target bolt-ai-development

# Production build
docker build . --target bolt-ai-production
```

4b. Docker Compose with Profiles to Run the Container

Use Docker Compose profiles to manage different environments:

```bash
# Development environment
docker-compose --profile development up

# Production environment
docker-compose --profile production up
```

When you run the Docker Compose command with the development profile, any changes you
make on your machine to the code will automatically be reflected in the site running
on the container (i.e. hot reloading still applies!).

4c. Using npm 
```bash
npm i . && npm run dev
```

## AI-Powered Full-Stack Web Development in the Browser

Bolt is an AI-powered web development agent that allows you to prompt, run, edit, and deploy full-stack applications directly from your browser—no local setup required. If you're here to build your own AI-powered web dev agent using the Bolt open source codebase, [click here to get started!](./CONTRIBUTING.md)

## What Makes Bolt Different

Claude, v0, etc are incredible- but you can't install packages, run backends or edit code. That’s where Bolt stands out:

- **Full-Stack in the Browser**: Bolt integrates cutting-edge AI models with an in-browser development environment powered by **StackBlitz’s WebContainers**. This allows you to:
  - Install and run npm tools and libraries (like Vite, Next.js, and more)
  - Run Node.js servers
  - Interact with third-party APIs
  - Deploy to production from chat
  - Share your work via a URL

- **AI with Environment Control**: Unlike traditional dev environments where the AI can only assist in code generation, Bolt gives AI models **complete control** over the entire  environment including the filesystem, node server, package manager, terminal, and browser console. This empowers AI agents to handle the entire app lifecycle—from creation to deployment.

Whether you’re an experienced developer, a PM or designer, Bolt allows you to build production-grade full-stack applications with ease.

For developers interested in building their own AI-powered development tools with WebContainers, check out the open-source Bolt codebase in this repo!

## Tips and Tricks

Here are some tips to get the most out of Bolt:

- **Be specific about your stack**: If you want to use specific frameworks or libraries (like Astro, Tailwind, ShadCN, or any other popular JavaScript framework), mention them in your initial prompt to ensure Bolt scaffolds the project accordingly.

- **Use the enhance prompt icon**: Before sending your prompt, try clicking the 'enhance' icon to have the AI model help you refine your prompt, then edit the results before submitting.

- **Scaffold the basics first, then add features**: Make sure the basic structure of your application is in place before diving into more advanced functionality. This helps Bolt understand the foundation of your project and ensure everything is wired up right before building out more advanced functionality.

- **Batch simple instructions**: Save time by combining simple instructions into one message. For example, you can ask Bolt to change the color scheme, add mobile responsiveness, and restart the dev server, all in one go saving you time and reducing API credit consumption significantly.