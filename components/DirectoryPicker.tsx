import React, { useState, useEffect, useCallback } from 'react';
import { GithubRepo, GithubContent } from '../types';
import * as githubService from '../services/githubService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { FolderIcon } from './icons/FolderIcon';
import { FileIcon } from './icons/FileIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';

interface DirectoryPickerProps {
  token: string;
  repo: GithubRepo;
  onClose: () => void;
  onSelect: (path: string) => void;
  initialPath: string;
}

const DirectoryPicker: React.FC<DirectoryPickerProps> = ({ token, repo, onClose, onSelect, initialPath }) => {
  const [currentPath, setCurrentPath] = useState(initialPath || '');
  const [contents, setContents] = useState<GithubContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await githubService.getRepoContents(token, repo.owner.login, repo.name, path);
      const sortedItems = items.sort((a, b) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1;
        if (a.type !== 'dir' && b.type === 'dir') return 1;
        return a.name.localeCompare(b.name);
      });
      setContents(sortedItems);
    } catch (err) {
      setError('Failed to fetch directory contents. The path might not exist.');
    } finally {
      setIsLoading(false);
    }
  }, [token, repo]);

  useEffect(() => {
    fetchContents(currentPath);
  }, [currentPath, fetchContents]);

  const handleItemClick = (item: GithubContent) => {
    if (item.type === 'dir') {
      setCurrentPath(item.path);
    }
  };

  const goUp = () => {
    if (currentPath === '') return;
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <header className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Select a Directory</h3>
          <p className="text-sm text-gray-500 break-all">Current Path: /{currentPath}</p>
        </header>

        <div className="p-4 overflow-y-auto flex-grow">
          {isLoading ? (
             <div className="flex justify-center items-center h-full">
                <SpinnerIcon className="animate-spin h-8 w-8 text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">{error}</div>
          ) : (
            <ul className="space-y-1">
              {contents.map(item => (
                <li
                  key={item.sha}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    item.type === 'dir'
                      ? 'cursor-pointer hover:bg-blue-50'
                      : 'cursor-not-allowed text-gray-400'
                  }`}
                >
                  {item.type === 'dir' ? (
                    <FolderIcon className="w-5 h-5 mr-3 text-blue-500" />
                  ) : (
                    <FileIcon className="w-5 h-5 mr-3 text-gray-400" />
                  )}
                  <span className="truncate">{item.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-lg">
          <button
            onClick={goUp}
            disabled={currentPath === '' || isLoading}
            className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpIcon className="w-4 h-4 mr-2" />
            Go Up
          </button>
          <div>
            <button
                onClick={onClose}
                className="mr-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded border border-gray-300 transition duration-200"
            >
                Cancel
            </button>
            <button
                onClick={() => onSelect(currentPath)}
                disabled={isLoading || !!error}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
            >
                Select this Directory
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DirectoryPicker;
