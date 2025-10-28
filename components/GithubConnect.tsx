
import React, { useState } from 'react';
import { KeyIcon } from './icons/KeyIcon';
import { GithubIcon } from './icons/GithubIcon';
import { LinkIcon } from './icons/LinkIcon';
import { AstroIcon } from './icons/AstroIcon';
import { useI18n } from '../i18n/I18nContext';

interface GithubConnectProps {
  onSubmit: (token: string, repoUrl: string) => void;
  error: string | null;
}

const GithubConnect: React.FC<GithubConnectProps> = ({ onSubmit, error }) => {
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token && repoUrl) {
      setIsLoading(true);
      await onSubmit(token, repoUrl);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200 w-full max-w-md">
      <div className="text-center mb-8">
        <AstroIcon className="w-12 h-12 mx-auto mb-4 text-gray-800" />
        <h1 className="text-2xl font-bold text-gray-900">
            {t('githubConnect.title')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
            {t('githubConnect.subtitle')}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-1">{t('githubConnect.repoUrlLabel')}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    id="repoUrl"
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder={t('githubConnect.repoUrlPlaceholder')}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
        </div>
        
        <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">{t('githubConnect.tokenLabel')}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    id="token"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder={t('githubConnect.tokenPlaceholder')}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <p className="mt-2 text-xs text-gray-500">
                {t('githubConnect.tokenHelp.p1')}
                <a href="https://github.com/settings/tokens/new?type=beta" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                    {t('githubConnect.tokenHelp.link')}
                </a>
                {t('githubConnect.tokenHelp.p2')}
                <b className="text-gray-600">{t('githubConnect.tokenHelp.b')}</b>
                {t('githubConnect.tokenHelp.p3')}
            </p>
        </div>

        <button
          type="submit"
          disabled={!token || !repoUrl || isLoading}
          className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('githubConnect.connecting') : (
            <>
              <GithubIcon className="w-5 h-5 mr-2" />
              {t('githubConnect.connectButton')}
            </>
          )}
        </button>
      </form>
      
      {error && <p className="mt-4 text-red-600 text-sm text-center">{error}</p>}
      
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>{t('githubConnect.tokenDisclaimer')}</p>
      </div>
    </div>
  );
};

export default GithubConnect;