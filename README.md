[![Bolt.new: AI-Powered Full-Stack Web Development in the Browser](./public/social_preview_index.jpg)](https://bolt.new)

# Bolt.diy (Previously oTToDev)

Welcome to Bolt.diy, the official open source version of Bolt.new (previously known as oTToDev and Bolt.new ANY LLM), which allows you to choose the LLM that you use for each prompt! Currently, you can use OpenAI, Anthropic, Ollama, OpenRouter, Gemini, LMStudio, Mistral, xAI, HuggingFace, DeepSeek, or Groq models - and it is easily extended to use any other model supported by the Vercel AI SDK! See the instructions below for running this locally and extending it to include more models.

Check the [Bolt.diy Docs](https://stackblitz-labs.github.io/bolt.diy/) for more information. This documentation is still being updated after the transfer.

Bolt.diy was originally started by [Cole Medin](https://www.youtube.com/@ColeMedin) but has quickly grown into a massive community effort to build the BEST open source AI coding assistant!

## Join the community for Bolt.diy!

https://thinktank.ottomator.ai


## Requested Additions - Feel Free to Contribute!

- ✅ OpenRouter Integration (@coleam00)
- ✅ Gemini Integration (@jonathands)
- ✅ Autogenerate Ollama models from what is downloaded (@yunatamos)
- ✅ Filter models by provider (@jasonm23)
- ✅ Download project as ZIP (@fabwaseem)
- ✅ Improvements to the main Bolt.new prompt in `app\lib\.server\llm\prompts.ts` (@kofi-bhr)
- ✅ DeepSeek API Integration (@zenith110)
- ✅ Mistral API Integration (@ArulGandhi)
- ✅ "Open AI Like" API Integration (@ZerxZ)
- ✅ Ability to sync files (one way sync) to local folder (@muzafferkadir)
- ✅ Containerize the application with Docker for easy installation (@aaronbolton)
- ✅ Publish projects directly to GitHub (@goncaloalves)
- ✅ Ability to enter API keys in the UI (@ali00209)
- ✅ xAI Grok Beta Integration (@milutinke)
- ✅ LM Studio Integration (@karrot0)
- ✅ HuggingFace Integration (@ahsan3219)
- ✅ Bolt terminal to see the output of LLM run commands (@thecodacus)
- ✅ Streaming of code output (@thecodacus)
- ✅ Ability to revert code to earlier version (@wonderwhy-er)
- ✅ Cohere Integration (@hasanraiyan)
- ✅ Dynamic model max token length (@hasanraiyan)
- ✅ Better prompt enhancing (@SujalXplores)
- ✅ Prompt caching (@SujalXplores)
- ✅ Load local projects into the app (@wonderwhy-er)
- ✅ Together Integration (@mouimet-infinisoft)
- ✅ Mobile friendly (@qwikode)
- ✅ Better prompt enhancing (@SujalXplores)
- ✅ Attach images to prompts (@atrokhym)
- ✅ Detect package.json and commands to auto install and run preview for folder and git import (@wonderwhy-er)
- ⬜ **HIGH PRIORITY** - Prevent Bolt from rewriting files as often (file locking and diffs)
- ⬜ **HIGH PRIORITY** - Better prompting for smaller LLMs (code window sometimes doesn't start)
- ⬜ **HIGH PRIORITY** - Run agents in the backend as opposed to a single model call
- ⬜ Deploy directly to Vercel/Netlify/other similar platforms
- ⬜ Have LLM plan the project in a MD file for better results/transparency
- ⬜ VSCode Integration with git-like confirmations
- ⬜ Upload documents for knowledge - UI design templates, a code base to reference coding style, etc.
- ⬜ Voice prompting
- ⬜ Azure Open AI API Integration
- ⬜ Perplexity Integration
- ⬜ Vertex AI Integration

## Bolt.new: AI-Powered Full-Stack Web Development in the Browser

Bolt.new (and by extension Bolt.diy) is an AI-powered web development agent that allows you to prompt, run, edit, and deploy full-stack applications directly from your browser—no local setup required. If you're here to build your own AI-powered web dev agent using the Bolt open source codebase, [click here to get started!](./CONTRIBUTING.md)

## What Makes Bolt.new Different

Claude, v0, etc are incredible- but you can't install packages, run backends, or edit code. That’s where Bolt.new stands out:

- **Full-Stack in the Browser**: Bolt.new integrates cutting-edge AI models with an in-browser development environment powered by **StackBlitz’s WebContainers**. This allows you to:
  - Install and run npm tools and libraries (like Vite, Next.js, and more)
  - Run Node.js servers
  - Interact with third-party APIs
  - Deploy to production from chat
  - Share your work via a URL

- **AI with Environment Control**: Unlike traditional dev environments where the AI can only assist in code generation, Bolt.new gives AI models **complete control** over the entire  environment including the filesystem, node server, package manager, terminal, and browser console. This empowers AI agents to handle the whole app lifecycle—from creation to deployment.

Whether you’re an experienced developer, a PM, or a designer, Bolt.new allows you to easily build production-grade full-stack applications.

For developers interested in building their own AI-powered development tools with WebContainers, check out the open-source Bolt codebase in this repo!

## Setup  

If you're new to installing software from GitHub, don't worry! If you encounter any issues, feel free to submit an "issue" using the provided links or improve this documentation by forking the repository, editing the instructions, and submitting a pull request.  

### Prerequisites  

1. **Install Git**: [Download Git](https://git-scm.com/downloads)  
2. **Install Node.js**: [Download Node.js](https://nodejs.org/en/download/)  

   - After installation, the Node.js path is usually added to your system automatically. To verify:  
     - **Windows**: Search for "Edit the system environment variables," click "Environment Variables," and check if `Node.js` is in the `Path` variable.  
     - **Mac/Linux**: Open a terminal and run:  
       ```bash  
       echo $PATH  
       ```  
       Look for `/usr/local/bin` in the output.  

### Clone the Repository  

Clone the repository using Git:  

```bash  
git clone https://github.com/stackblitz-labs/bolt.diy.git  
```  

### (Optional) Configure Environment Variables  

Most environment variables can be configured directly through the settings menu of the application. However, if you need to manually configure them:  

1. Rename `.env.example` to `.env.local`.  
2. Add your LLM API keys. For example:  

```env  
GROQ_API_KEY=YOUR_GROQ_API_KEY  
OPENAI_API_KEY=YOUR_OPENAI_API_KEY  
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY  
```  

**Note**: Ollama does not require an API key as it runs locally.  

3. Optionally, set additional configurations:  

```env  
# Debugging  
VITE_LOG_LEVEL=debug  

# Ollama settings (example: 8K context, localhost port 11434)  
OLLAMA_API_BASE_URL=http://localhost:11434  
DEFAULT_NUM_CTX=8192  
```  

**Important**: Do not commit your `.env.local` file to version control. This file is already included in `.gitignore`.  

---

## Run the Application  

### Option 1: Without Docker

1. **Install Dependencies**:  
   ```bash  
   pnpm install  
   ```  
   If `pnpm` is not installed, install it using:  
   ```bash  
   sudo npm install -g pnpm  
   ```  

2. **Start the Application**:  
   ```bash  
   pnpm run dev  
   ```
   This will start the Remix Vite development server. You will need Google Chrome Canary to run this locally if you use Chrome! It's an easy install and a good browser for web development anyway.  

### Option 2: With Docker  

#### Prerequisites  
- Ensure Git, Node.js, and Docker are installed: [Download Docker](https://www.docker.com/)  

#### Steps  

1. **Build the Docker Image**:  

   Use the provided NPM scripts:  
   ```bash  
   npm run dockerbuild       # Development build  
   npm run dockerbuild:prod  # Production build  
   ```  

   Alternatively, use Docker commands directly:  
   ```bash  
   docker build . --target bolt-ai-development  # Development build  
   docker build . --target bolt-ai-production   # Production build  
   ```  

2. **Run the Container**:  
   Use Docker Compose profiles to manage environments:  
   ```bash  
   docker-compose --profile development up  # Development  
   docker-compose --profile production up   # Production  
   ```  

   - With the development profile, changes to your code will automatically reflect in the running container (hot reloading).  

---

### Update Your Local Version to the Latest

To keep your local version of Bolt.diy up to date with the latest changes, follow these steps for your operating system:

#### 1. **Navigate to your project folder**  
   Navigate to the directory where you cloned the repository and open a terminal:

#### 2. **Fetch the Latest Changes**  
   Use Git to pull the latest changes from the main repository:

   ```bash
   git pull origin main
   ```

#### 3. **Update Dependencies**  
   After pulling the latest changes, update the project dependencies by running the following command:

     ```bash
     pnpm install
     ```

#### 4. **Run the Application**  
   Once the updates are complete, you can start the application again with:

   ```bash
   pnpm run dev
   ```

This ensures that you're running the latest version of Bolt.diy and can take advantage of all the newest features and bug fixes.

---

## Available Scripts  

Here are the available commands for managing the application:  

- `pnpm run dev`: Start the development server.  
- `pnpm run build`: Build the project.  
- `pnpm run start`: Run the built application locally (uses Wrangler Pages).  
- `pnpm run preview`: Build and start the application locally for production testing.  
- `pnpm test`: Run the test suite using Vitest.  
- `pnpm run typecheck`: Perform TypeScript type checking.  
- `pnpm run typegen`: Generate TypeScript types using Wrangler.  
- `pnpm run deploy`: Build and deploy the project to Cloudflare Pages.  
- `pnpm lint:fix`: Run the linter and automatically fix issues.  

## How do I contribute to Bolt.diy?

[Please check out our dedicated page for contributing to Bolt.diy here!](CONTRIBUTING.md)

## What are the future plans for Bolt.diy?

[Check out our Roadmap here!](https://roadmap.sh/r/ottodev-roadmap-2ovzo)

Lot more updates to this roadmap coming soon!

## FAQ

[Please check out our dedicated page for FAQ's related to Bolt.diy here!](FAQ.md)
