

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
import { ExclamationTriangleIcon } from './components/icons/ExclamationTriangleIcon';
import { CloseIcon } from './components/icons/CloseIcon';

const App: React.FC = () => {
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);
  const [shouldResetOnLogout, setShouldResetOnLogout] = useState(false);
  const { t } = useI18n();
  
  // This function performs a clean logout without user confirmation.
  // Used for internal error handling (e.g., failed session restore).
  const performSimpleLogout = useCallback(() => {
    sessionStorage.removeItem('github_pat_encrypted');
    sessionStorage.removeItem('crypto_key');
    sessionStorage.removeItem('selected_repo');
    setGithubToken(null);
    setUser(null);
    setSelectedRepo(null);
    setError(null);
  }, []);
  
  // This function is called when a user clicks any logout button.
  // It opens the confirmation modal.
  const handleRequestLogout = (withReset: boolean) => {
    setShouldResetOnLogout(withReset);
    setIsLogoutConfirmVisible(true);
  };
  
  const handleCancelLogout = () => {
    setIsLogoutConfirmVisible(false);
  };
  
  // This function is called when the user confirms the logout in the modal.
  const handleConfirmLogout = useCallback(() => {
    if (shouldResetOnLogout && selectedRepo) {
      const repoFullName = selectedRepo.full_name;
      // Per-repo keys from localStorage
      const repoSpecificKeys = [
        `projectType_${repoFullName}`, `postsPath_${repoFullName}`, `imagesPath_${repoFullName}`,
        `domainUrl_${repoFullName}`, `postTemplate_${repoFullName}`,
      ];
      // Global keys from localStorage
      const globalKeys = [
        'postFileTypes', 'imageFileTypes', 'publishDateSource', 'imageCompressionEnabled',
        'maxImageSize', 'imageResizeMaxWidth', 'newPostCommit', 'updatePostCommit',
        'newImageCommit', 'updateImageCommit', 'astro-content-manager-lang'
      ];
      [...repoSpecificKeys, ...globalKeys].forEach(key => localStorage.removeItem(key));
    }
    
    // Perform the actual logout
    performSimpleLogout();
    
    // Close modal
    setIsLogoutConfirmVisible(false);
  }, [selectedRepo, shouldResetOnLogout, performSimpleLogout]);

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

          const userData = await githubService.verifyToken(token);
          const repoData = await githubService.getRepoDetails(token, repo.owner.login, repo.name);

          if (!repoData.permissions?.push) {
            throw new Error("You do not have write permissions for this repository.");
          }

          setUser(userData);
          setGithubToken(token);
          setSelectedRepo(repoData);
        } catch (e) {
          console.error("Session restore failed:", e);
          performSimpleLogout(); // Clear potentially corrupted session data
        } finally {
          setIsLoading(false);
        }
      };
      restoreSession();
    } else {
      setIsLoading(false);
    }
  }, [performSimpleLogout]);

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
      
      const key = await generateCryptoKey();
      const encryptedToken = await encryptData(token, key);
      const exportedKey = await exportCryptoKey(key);

      sessionStorage.setItem('github_pat_encrypted', encryptedToken);
      sessionStorage.setItem('crypto_key', JSON.stringify(exportedKey));
      sessionStorage.setItem('selected_repo', JSON.stringify(repoData));

      setUser(userData);
      setGithubToken(token);
      setSelectedRepo(repoData);

    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : t('app.error.unknown');
      if (errorMessage.includes("write permissions")) {
        errorMessage = t('app.error.noWritePermissions');
      }
      setError(t('app.error.loginFailed', { message: errorMessage }));
      performSimpleLogout(); // Clear any partial login state
    } finally {
      setIsLoading(false);
    }
  }, [performSimpleLogout, t]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {isLogoutConfirmVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-yellow-500" />
                        {t('app.logoutConfirm.title')}
                    </h3>
                    <button onClick={handleCancelLogout} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close modal">
                      <CloseIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </header>
                <main className="p-6 border-t border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">{t('app.logoutConfirm.description')}</p>
                    <div className="flex items-start bg-gray-50 p-3 rounded-md border border-gray-200">
                        <div className="flex items-center h-5">
                            <input
                                id="reset-settings-checkbox"
                                name="reset-settings"
                                type="checkbox"
                                checked={shouldResetOnLogout}
                                onChange={(e) => setShouldResetOnLogout(e.target.checked)}
                                className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="reset-settings-checkbox" className="font-medium text-gray-700">{t('app.logoutConfirm.resetLabel')}</label>
                            <p className="text-gray-500 text-xs mt-1">{t('app.logoutConfirm.resetHelp')}</p>
                        </div>
                    </div>
                </main>
                <footer className="p-4 bg-gray-50 flex justify-end items-center space-x-3">
                    <button onClick={handleCancelLogout} className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded border border-gray-300 transition duration-200">
                        {t('app.logoutConfirm.cancel')}
                    </button>
                    <button onClick={handleConfirmLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                        {t('app.logout')}
                    </button>
                </footer>
            </div>
        </div>
      )}

      {!githubToken || !user || !selectedRepo ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <GithubConnect onSubmit={handleLogin} error={error} />
            <footer className="text-center mt-8 text-gray-500 text-sm">
                <a href="https://github.com/tienledigital/astro-content-manager" target="_blank" rel="noopener noreferrer" className="inline-flex items-center hover:text-blue-600 transition-colors">
                    <GithubIcon className="w-4 h-4 mr-1.5" />
                    Astro Content Manager v1.3.2
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
                            onClick={() => handleRequestLogout(false)}
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
                <Dashboard token={githubToken} repo={selectedRepo} onResetAndLogout={() => handleRequestLogout(true)} />
            </main>
        </div>
      )}
    </div>
  );
};

export default App;