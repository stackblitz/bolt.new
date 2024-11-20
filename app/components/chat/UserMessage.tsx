// @ts-nocheck
// Preventing TS checks with files presented in the video for a better presentation.
import { modificationsRegex } from '~/utils/diff';
import { MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';
import { Markdown } from './Markdown';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  const sanitizedContent = sanitizeUserMessage(content);
  const textContent = Array.isArray(sanitizedContent) 
    ? sanitizedContent.find(item => item.type === 'text')?.text || ''
    : sanitizedContent;

  return (
    <div className="overflow-hidden pt-[4px]">
      <Markdown limitedMarkdown>{textContent}</Markdown>
    </div>
  );
}

function sanitizeUserMessage(content: string | Array<{type: string, text?: string, image_url?: {url: string}}>) {
  if (Array.isArray(content)) {
    return content.map(item => {
      if (item.type === 'text') {
        return {
          type: 'text',
          text: item.text?.replace(/\[Model:.*?\]\n\n/, '').replace(/\[Provider:.*?\]\n\n/, '')
        };
      }
      return item; // Keep image_url items unchanged
    });
  }
  
  // Handle legacy string content
  return content.replace(/\[Model:.*?\]\n\n/, '').replace(/\[Provider:.*?\]\n\n/, '');
}
