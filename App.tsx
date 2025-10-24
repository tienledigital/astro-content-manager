import React, { useState, useEffect, useCallback } from 'react';
import GithubConnect from './components/GithubConnect';
import ContentUploader from './components/ContentUploader';
import { GithubUser, GithubRepo } from './types';
import * as githubService from './services/githubService';
import { GithubIcon } from './components/icons/GithubIcon';
import { AstroIcon } from './components/icons/AstroIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
// Import repo info from the virtual module created by the integration
import { owner, repoName } from 'virtual:astro-github-content-manager/config';


const App: React.FC = () => {
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // The repository is now fixed, determined by the integration
  const [repo] = useState<GithubRepo | null>(() => {
    if (!owner || !repoName) return null;
    // We construct a partial GithubRepo object. 
    // This is enough for the ContentUploader to work.
    // A full fetch could be added if more details are needed.
    return {
      id: 0, // Not available without an API call
      name: repoName,
      full_name: `${owner}/${repoName}`,
      owner: { login: owner },
      private: false, // Assume public, can be fetched if needed
      description: 'Current Astro Project',
      html_url: `https://github.com/${owner}/${repoName}`,
      pushed_at: new Date().toISOString()
    };
  });


  useEffect(() => {
    const token = sessionStorage.getItem('github_pat');
    if (token) {
      handleTokenSubmit(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleTokenSubmit = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    if (!repo) {
      setError("Astro integration couldn't identify the GitHub repository.");
      setIsLoading(false);
      return;
    }
    try {
      const userData = await githubService.verifyToken(token);
      setUser(userData);
      setGithubToken(token);
      sessionStorage.setItem('github_pat', token);
    } catch (err) {
      setError('Invalid GitHub token. Please check and try again.');
      sessionStorage.removeItem('github_pat');
      setGithubToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [repo]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('github_pat');
    setGithubToken(null);
    setUser(null);
    setError(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!repo) {
         return <div className="text-center text-red-500 p-4">
            <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
            <p>The Astro Content Manager integration could not detect the GitHub repository for this project.</p>
            <p className="mt-2 text-sm text-gray-600">Please ensure this project is a Git repository with a remote named "origin" pointing to GitHub.</p>
        </div>
    }

    if (!githubToken || !user) {
      return <GithubConnect onSubmit={handleTokenSubmit} error={error} repoFullName={repo.full_name} />;
    }

    // Since the repo is fixed, we go straight to the uploader
    return <ContentUploader token={githubToken} repo={repo} />;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
       <div className="absolute top-4 right-4">
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-full" />
              <span className="ml-2 text-gray-700">{user.login}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              <LogoutIcon className="w-5 h-5 mr-2"/>
              Log Out
            </button>
          </div>
        )}
      </div>
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8 flex flex-col items-center">
          <AstroIcon className="w-16 h-16 mb-4 text-blue-500" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Astro Content Manager
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Effortlessly publish content to your Astro projects on GitHub.
          </p>
        </header>
        <main className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
          {renderContent()}
        </main>
        <footer className="text-center mt-8 text-gray-500">
            <p>Built for seamless content creation.</p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 hover:text-blue-600 transition-colors">
                <GithubIcon className="w-5 h-5 mr-2" />
                Powered by GitHub API
            </a>
        </footer>
      </div>
    </div>
  );
};

export default App;
