/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';
import { Markdown } from './Markdown';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  const textContent = sanitizeUserMessage(content);

  return (
    <div className="overflow-hidden pt-[4px]">
      <Markdown limitedMarkdown>{textContent}</Markdown>
    </div>
  );
}

function sanitizeUserMessage(content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>) {
  if (Array.isArray(content)) {
    const textItem = content.find((item) => item.type === 'text');
    return textItem?.text?.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '') || '';
  }

  return content.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '');
}
