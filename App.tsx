
import React, { useState, useEffect, useCallback } from 'react';
import GithubConnect from './components/GithubConnect';
import Dashboard from './components/Dashboard';
import { GithubUser, GithubRepo } from './types';
import * as githubService from './services/githubService';
import { GithubIcon } from './components/icons/GithubIcon';
import { AstroIcon } from './components/icons/AstroIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
import { parseRepoUrl } from './utils/parsing';
import { generateCryptoKey, exportCryptoKey, importCryptoKey, encryptData, decryptData } from './utils/crypto';
import { useI18n } from './i18n/I18nContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';

const App: React.FC = () => {
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('github_pat_encrypted');
    sessionStorage.removeItem('crypto_key');
    sessionStorage.removeItem('selected_repo');
    setGithubToken(null);
    setUser(null);
    setSelectedRepo(null);
    setError(null);
  }, []);

  useEffect(() => {
    const encryptedToken = sessionStorage.getItem('github_pat_encrypted');
    const keyJson = sessionStorage.getItem('crypto_key');
    const repoJson = sessionStorage.getItem('selected_repo');

    if (encryptedToken && keyJson && repoJson) {
      const restoreSession = async () => {
        setIsLoading(true);
        try {
          const key = await importCryptoKey(JSON.parse(keyJson));
          const token = await decryptData(encryptedToken, key);
          const repo = JSON.parse(repoJson);

          // Verify the restored token and repo details
          const userData = await githubService.verifyToken(token);
          const repoData = await githubService.getRepoDetails(token, repo.owner.login, repo.name);

          if (!repoData.permissions?.push) {
            throw new Error("You do not have write permissions for this repository.");
          }

          // If verification is successful, set the application state
          setUser(userData);
          setGithubToken(token);
          setSelectedRepo(repoData);
        } catch (e) {
          console.error("Session restore failed:", e);
          handleLogout(); // Clear potentially corrupted or outdated session data
        } finally {
          setIsLoading(false);
        }
      };
      restoreSession();
    } else {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    document.body.classList.add('login-bg');
    return () => {
      document.body.classList.remove('login-bg');
    };
  }, []);

  const handleLogin = useCallback(async (token: string, repoUrl: string) => {
    setIsLoading(true);
    setError(null);

    const repoParts = parseRepoUrl(repoUrl);
    if (!repoParts) {
      setError(t('app.error.invalidRepoUrl'));
      setIsLoading(false);
      return;
    }
    const { owner, repo } = repoParts;

    try {
      const userData = await githubService.verifyToken(token);
      
      const repoData = await githubService.getRepoDetails(token, owner, repo);
      
      if (!repoData.permissions?.push) {
        throw new Error("You do not have write permissions for this repository.");
      }
      
      // Encrypt and store session data
      const key = await generateCryptoKey();
      const encryptedToken = await encryptData(token, key);
      const exportedKey = await exportCryptoKey(key);

      sessionStorage.setItem('github_pat_encrypted', encryptedToken);
      sessionStorage.setItem('crypto_key', JSON.stringify(exportedKey));
      sessionStorage.setItem('selected_repo', JSON.stringify(repoData));

      // Set component state
      setUser(userData);
      setGithubToken(token);
      setSelectedRepo(repoData);

    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : t('app.error.unknown');
      if (errorMessage === "You do not have write permissions for this repository.") {
        errorMessage = t('app.error.noWritePermissions');
      }
      setError(t('app.error.loginFailed', { message: errorMessage }));
      handleLogout(); // Clear any partial login state
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout, t]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!githubToken || !user || !selectedRepo ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <GithubConnect onSubmit={handleLogin} error={error} />
            <footer className="text-center mt-8 text-gray-500 text-sm">
                <a href="https://github.com/tienledigital/astro-content-manager" target="_blank" rel="noopener noreferrer" className="inline-flex items-center hover:text-blue-600 transition-colors">
                    <GithubIcon className="w-4 h-4 mr-1.5" />
                    Astro Content Manager v1.3.1
                </a>
            </footer>
        </div>
      ) : (
        <div className="w-full">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-4">
                        <AstroIcon className="w-8 h-8 text-blue-500" />
                        <h1 className="text-xl font-bold text-gray-800">
                        Astro Content Manager
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <div className="flex items-center">
                            <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-full" />
                            <span className="ml-2 text-gray-700 hidden sm:block">{user.login}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-md transition duration-200 text-sm"
                            title={t('app.logout')}
                        >
                            <LogoutIcon className="w-5 h-5 sm:mr-2"/>
                            <span className="hidden sm:inline">{t('app.logout')}</span>
                        </button>
                    </div>
                    </div>
                </div>
            </header>
            <main className="p-4 md:p-8">
                <Dashboard token={githubToken} repo={selectedRepo} />
            </main>
        </div>
      )}
    </div>
  );
};

export default App;
