import { modificationsRegex } from '~/utils/diff';
import { Markdown } from './Markdown';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="overflow-hidden pt-[4px]">
      <Markdown limitedMarkdown>{sanitizeUserMessage(content)}</Markdown>
    </div>
  );
}

function sanitizeUserMessage(content: string) {
  return content.replace(modificationsRegex, '').trim();
}
