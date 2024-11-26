import type { Message } from 'ai';
import { generateId, detectProjectType } from './fileUtils';

export const createChatFromFolder = async (
  files: File[],
  binaryFiles: string[],
  folderName: string
): Promise<{ userMessage: Message; assistantMessage: Message }> => {
  const fileArtifacts = await Promise.all(
    files.map(async (file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          const relativePath = file.webkitRelativePath.split('/').slice(1).join('/');
          resolve(
            `<boltAction type="file" filePath="${relativePath}">
${content}
</boltAction>`,
          );
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }),
  );

  const project = await detectProjectType(files);
  const setupCommand = project.setupCommand ? `\n\n<boltAction type="shell">\n${project.setupCommand}\n</boltAction>` : '';
  const followupMessage = project.followupMessage ? `\n\n${project.followupMessage}` : '';

  const binaryFilesMessage = binaryFiles.length > 0
    ? `\n\nSkipped ${binaryFiles.length} binary files:\n${binaryFiles.map((f) => `- ${f}`).join('\n')}`
    : '';

  const assistantMessage: Message = {
    role: 'assistant',
    content: `I've imported the contents of the "${folderName}" folder.${binaryFilesMessage}

<boltArtifact id="imported-files" title="Imported Files">
${fileArtifacts.join('\n\n')}
${setupCommand}
</boltArtifact>${followupMessage}`,
    id: generateId(),
    createdAt: new Date(),
  };

  const userMessage: Message = {
    role: 'user',
    id: generateId(),
    content: `Import the "${folderName}" folder`,
    createdAt: new Date(),
  };

  return { userMessage, assistantMessage };
};
