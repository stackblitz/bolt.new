# Frequently Asked Questions (FAQ)

## How do I get the best results with oTToDev?

- **Be specific about your stack**:  
  Mention the frameworks or libraries you want to use (e.g., Astro, Tailwind, ShadCN) in your initial prompt. This ensures that oTToDev scaffolds the project according to your preferences.

- **Use the enhance prompt icon**:  
  Before sending your prompt, click the *enhance* icon to let the AI refine your prompt. You can edit the suggested improvements before submitting.

- **Scaffold the basics first, then add features**:  
  Ensure the foundational structure of your application is in place before introducing advanced functionality. This helps oTToDev establish a solid base to build on.

- **Batch simple instructions**:  
  Combine simple tasks into a single prompt to save time and reduce API credit consumption. For example:  
  *"Change the color scheme, add mobile responsiveness, and restart the dev server."*

---

## How do I contribute to oTToDev?

Check out our [Contribution Guide](CONTRIBUTING.md) for more details on how to get involved!

---

## Do you plan on merging oTToDev back into the official Bolt.new repo?

Stay tuned! We’ll share updates on this early next month.

---

## What are the future plans for oTToDev?

Visit our [Roadmap](https://roadmap.sh/r/ottodev-roadmap-2ovzo) for the latest updates.  
New features and improvements are on the way!

---

## Why are there so many open issues/pull requests?

oTToDev began as a small showcase project on @ColeMedin's YouTube channel to explore editing open-source projects with local LLMs. However, it quickly grew into a massive community effort!  

We’re forming a team of maintainers to manage demand and streamline issue resolution. The maintainers are rockstars, and we’re also exploring partnerships to help the project thrive.

---

## How do local LLMs compare to larger models like Claude 3.5 Sonnet for oTToDev/Bolt.new?

While local LLMs are improving rapidly, larger models like GPT-4o, Claude 3.5 Sonnet, and DeepSeek Coder V2 236b still offer the best results for complex applications. Our ongoing focus is to improve prompts, agents, and the platform to better support smaller local LLMs.

---

## Common Errors and Troubleshooting

### **"There was an error processing this request"**
This generic error message means something went wrong. Check both:
- The terminal (if you started the app with Docker or `pnpm`).
- The developer console in your browser (press `F12` or right-click > *Inspect*, then go to the *Console* tab).

---

### **"x-api-key header missing"**
This error is sometimes resolved by restarting the Docker container.  
If that doesn’t work, try switching from Docker to `pnpm` or vice versa. We’re actively investigating this issue.

---

### **Blank preview when running the app**
A blank preview often occurs due to hallucinated bad code or incorrect commands.  
To troubleshoot:
- Check the developer console for errors.
- Remember, previews are core functionality, so the app isn’t broken! We’re working on making these errors more transparent.

---

### **"Everything works, but the results are bad"**
Local LLMs like Qwen-2.5-Coder are powerful for small applications but still experimental for larger projects. For better results, consider using larger models like GPT-4o, Claude 3.5 Sonnet, or DeepSeek Coder V2 236b.

---

Got more questions? Feel free to reach out or open an issue in our GitHub repo!