/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';
import { Markdown } from './Markdown';

interface UserMessageProps {
  content: string | Array<{ type: string; text?: string; image?: string }>;
}

export function UserMessage({ content }: UserMessageProps) {
  if (Array.isArray(content)) {
    const textItem = content.find((item) => item.type === 'text');
    const textContent = sanitizeUserMessage(textItem?.text || '');
    const images = content.filter((item) => item.type === 'image' && item.image);

    return (
      <div className="overflow-hidden pt-[4px]">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <Markdown limitedMarkdown>{textContent}</Markdown>
          </div>
          {images.length > 0 && (
            <div className="flex-shrink-0 w-[160px]">
              {images.map((item, index) => (
                <div key={index} className="relative">
                  <img
                    src={item.image}
                    alt={`Uploaded image ${index + 1}`}
                    className="w-full h-[160px] rounded-lg object-cover border border-bolt-elements-borderColor"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const textContent = sanitizeUserMessage(content);

  return (
    <div className="overflow-hidden pt-[4px]">
      <Markdown limitedMarkdown>{textContent}</Markdown>
    </div>
  );
}

function sanitizeUserMessage(content: string) {
  return content.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '');
}
