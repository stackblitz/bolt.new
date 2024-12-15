[![bolt.diy: AI-Powered Full-Stack Web Development in the Browser](./public/social_preview_index.jpg)](https://bolt.diy)

# bolt.diy

## FAQ

### How do I get the best results with bolt.diy?

- **Be specific about your stack**: If you want to use specific frameworks or libraries (like Astro, Tailwind, ShadCN, or any other popular JavaScript framework), mention them in your initial prompt to ensure bolt scaffolds the project accordingly.

- **Use the enhance prompt icon**: Before sending your prompt, try clicking the 'enhance' icon to have the AI model help you refine your prompt, then edit the results before submitting.

- **Scaffold the basics first, then add features**: Make sure the basic structure of your application is in place before diving into more advanced functionality. This helps Bolt.diy understand the foundation of your project and ensure everything is wired up right before building out more advanced functionality.

- **Batch simple instructions**: Save time by combining simple instructions into one message. For example, you can ask Bolt.diy to change the color scheme, add mobile responsiveness, and restart the dev server, all in one go saving you time and reducing API credit consumption significantly.

### Why are there so many open issues/pull requests?

bolt.diy was started simply to showcase how to edit an open source project and to do something cool with local LLMs on my (@ColeMedin) YouTube channel! However, it quickly grew into a massive community project that I am working hard to keep up with the demand of by forming a team of maintainers and getting as many people involved as I can. That effort is going well and all of our maintainers are ABSOLUTE rockstars, but it still takes time to organize everything so we can efficiently get through all the issues and PRs. But rest assured, we are working hard and even working on some partnerships behind the scenes to really help this project take off!

### How do local LLMs fair compared to larger models like Claude 3.5 Sonnet for bolt.diy/bolt.new?

As much as the gap is quickly closing between open source and massive close source models, you’re still going to get the best results with the very large models like GPT-4o, Claude 3.5 Sonnet, and DeepSeek Coder V2 236b. This is one of the big tasks we have at hand - figuring out how to prompt better, use agents, and improve the platform as a whole to make it work better for even the smaller local LLMs!

### I'm getting the error: "There was an error processing this request"

If you see this error within bolt.diy, that is just the application telling you there is a problem at a high level, and this could mean a number of different things. To find the actual error, please check BOTH the terminal where you started the application (with Docker or pnpm) and the developer console in the browser. For most browsers, you can access the developer console by pressing F12 or right clicking anywhere in the browser and selecting “Inspect”. Then go to the “console” tab in the top right.

### I'm getting the error: "x-api-key header missing"

We have seen this error a couple times and for some reason just restarting the Docker container has fixed it. This seems to be Ollama specific. Another thing to try is try to run bolt.diy with Docker or pnpm, whichever you didn’t run first. We are still on the hunt for why this happens once and a while!

### I'm getting a blank preview when bolt.diy runs my app!

We promise you that we are constantly testing new PRs coming into bolt.diy and the preview is core functionality, so the application is not broken! When you get a blank preview or don’t get a preview, this is generally because the LLM hallucinated bad code or incorrect commands. We are working on making this more transparent so it is obvious. Sometimes the error will appear in developer console too so check that as well.

### How to add a LLM:

To make new LLMs available to use in this version of bolt.new, head on over to `app/utils/constants.ts` and find the constant MODEL_LIST. Each element in this array is an object that has the model ID for the name (get this from the provider's API documentation), a label for the frontend model dropdown, and the provider. 

By default, Anthropic, OpenAI, Groq, and Ollama are implemented as providers, but the YouTube video for this repo covers how to extend this to work with more providers if you wish!

When you add a new model to the MODEL_LIST array, it will immediately be available to use when you run the app locally or reload it. For Ollama models, make sure you have the model installed already before trying to use it here!

### Everything works but the results are bad

This goes to the point above about how local LLMs are getting very powerful but you still are going to see better (sometimes much better) results with the largest LLMs like GPT-4o, Claude 3.5 Sonnet, and DeepSeek Coder V2 236b. If you are using smaller LLMs like Qwen-2.5-Coder, consider it more experimental and educational at this point. It can build smaller applications really well, which is super impressive for a local LLM, but for larger scale applications you want to use the larger LLMs still!
