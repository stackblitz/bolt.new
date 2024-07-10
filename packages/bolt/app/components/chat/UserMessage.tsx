import { Markdown } from './Markdown';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="overflow-hidden">
      <Markdown>{content}</Markdown>
    </div>
  );
}
