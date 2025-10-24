import React, { useState } from 'react';
import { KeyIcon } from './icons/KeyIcon';
import { GithubIcon } from './icons/GithubIcon';

interface GithubConnectProps {
  onSubmit: (token: string) => void;
  error: string | null;
  repoFullName: string;
}

const GithubConnect: React.FC<GithubConnectProps> = ({ onSubmit, error, repoFullName }) => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      setIsLoading(true);
      await onSubmit(token);
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect to GitHub</h2>
       <p className="text-gray-600 mb-4">
        To manage content for <code className="font-mono bg-gray-200 px-1 py-0.5 rounded">{repoFullName}</code>
      </p>
      <p className="text-gray-600 mb-6">
        Please provide a <a href="https://github.com/settings/tokens/new?type=beta" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Fine-Grained Personal Access Token</a>.
        It needs <b className="text-gray-700">Read and write</b> access to <b className="text-gray-700">Contents</b> for this specific repository.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <KeyIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={!token || isLoading}
          className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Connecting...' : (
            <>
              <GithubIcon className="w-5 h-5 mr-2" />
              Connect to {repoFullName}
            </>
          )}
        </button>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      
      <div className="mt-6 p-4 border-l-4 border-yellow-400 bg-yellow-50 text-left">
        <h4 className="font-bold text-yellow-800">Security Note</h4>
        <p className="text-sm text-yellow-700 mt-1">
          Your Personal Access Token is only used for this repository and stored in this browser session. It will be cleared when you close this tab.
        </p>
      </div>
    </div>
  );
};

export default GithubConnect;