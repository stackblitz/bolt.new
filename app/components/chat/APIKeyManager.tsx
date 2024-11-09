import React, { useState } from 'react';
import { IconButton } from '~/components/ui/IconButton';

interface APIKeyManagerProps {
  provider: string;
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const APIKeyManager: React.FC<APIKeyManagerProps> = ({ provider, apiKey, setApiKey }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSave = () => {
    setApiKey(tempKey);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 mt-2 mb-2">
      <span className="text-sm text-bolt-elements-textSecondary">{provider} API Key:</span>
      {isEditing ? (
        <>
          <input
            type="password"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            className="flex-1 p-1 text-sm rounded border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus"
          />
          <IconButton onClick={handleSave} title="Save API Key">
            <div className="i-ph:check" />
          </IconButton>
          <IconButton onClick={() => setIsEditing(false)} title="Cancel">
            <div className="i-ph:x" />
          </IconButton>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-bolt-elements-textPrimary">
            {apiKey ? '••••••••' : 'Not set (will still work if set in .env file)'}
          </span>
          <IconButton onClick={() => setIsEditing(true)} title="Edit API Key">
            <div className="i-ph:pencil-simple" />
          </IconButton>
        </>
      )}
    </div>
  );
};
