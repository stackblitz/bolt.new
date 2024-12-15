import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { logStore } from '~/lib/stores/logs';

export default function ConnectionsTab() {
  const [githubUsername, setGithubUsername] = useState(Cookies.get('githubUsername') || '');
  const [githubToken, setGithubToken] = useState(Cookies.get('githubToken') || '');

  const handleSaveConnection = () => {
    Cookies.set('githubUsername', githubUsername);
    Cookies.set('githubToken', githubToken);
    logStore.logSystem('GitHub connection settings updated', {
      username: githubUsername,
      hasToken: !!githubToken,
    });
    toast.success('GitHub credentials saved successfully!');
    Cookies.set('git:github.com', JSON.stringify({ username: githubToken, password: 'x-oauth-basic' }));
  };

  return (
    <div className="p-4 mb-4 border border-bolt-elements-borderColor rounded-lg bg-bolt-elements-background-depth-3">
      <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">GitHub Connection</h3>
      <div className="flex mb-4">
        <div className="flex-1 mr-2">
          <label className="block text-sm text-bolt-elements-textSecondary mb-1">GitHub Username:</label>
          <input
            type="text"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            className="w-full bg-white dark:bg-bolt-elements-background-depth-4 relative px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary border border-bolt-elements-borderColor"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-bolt-elements-textSecondary mb-1">Personal Access Token:</label>
          <input
            type="password"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            className="w-full bg-white dark:bg-bolt-elements-background-depth-4 relative px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary border border-bolt-elements-borderColor"
          />
        </div>
      </div>
      <div className="flex mb-4">
        <button
          onClick={handleSaveConnection}
          className="bg-bolt-elements-button-primary-background rounded-lg px-4 py-2 mr-2 transition-colors duration-200 hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text"
        >
          Save Connection
        </button>
      </div>
    </div>
  );
}
