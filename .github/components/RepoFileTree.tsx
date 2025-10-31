import React, { useState, useEffect } from 'react';
import { GithubRepo } from '../types';
import * as githubService from '../services/githubService';
import { RepoTreeItem } from '../services/githubService';
import { FolderIcon } from './icons/FolderIcon';
import { FileIcon } from './icons/FileIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { StarIcon } from './icons/StarIcon';

interface TreeItemProps {
    item: RepoTreeItem;
    level: number;
    token: string;
    repo: GithubRepo;
    onSelectPath: (path: string) => void;
    selectedPath: string;
    suggestedPaths?: string[];
}

const TreeItem: React.FC<TreeItemProps> = ({ item, level, token, repo, onSelectPath, selectedPath, suggestedPaths = [] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [children, setChildren] = useState<RepoTreeItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.type !== 'dir') return;

        if (!isExpanded && children.length === 0) {
            setIsLoading(true);
            try {
                const fetchedChildren = await githubService.getRepoTree(token, repo.owner.login, repo.name, item.path);
                setChildren(fetchedChildren);
            } catch (error) {
                console.error("Failed to fetch tree children:", error);
            } finally {
                setIsLoading(false);
            }
        }
        setIsExpanded(!isExpanded);
    };
    
    const handleSelect = () => {
        if (item.type === 'dir') {
            onSelectPath(item.path);
        }
    };

    const isSelected = item.path === selectedPath;
    const isSuggested = suggestedPaths.includes(item.path);

    if (item.type === 'file') {
        return (
            <div style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }} className="flex items-center py-1 text-gray-500 text-sm">
                <FileIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
            </div>
        );
    }

    return (
        <div>
            <div
                onClick={handleSelect}
                className={`flex items-center p-1 rounded cursor-pointer text-sm transition-colors ${isSelected ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
                style={{ paddingLeft: `${level * 1.25}rem` }}
            >
                <button onClick={handleToggle} className="p-0.5 rounded-sm hover:bg-gray-200">
                    <ChevronRightIcon className={`w-4 h-4 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
                {isLoading ? (
                    <SpinnerIcon className="w-4 h-4 mx-1 animate-spin" />
                ) : (
                    <FolderIcon className={`w-4 h-4 mx-1 flex-shrink-0 ${item.hasMarkdown ? 'text-blue-500' : 'text-yellow-500'}`} />
                )}
                <span className="truncate font-medium">{item.name}</span>
                {isSuggested && !isSelected && (
                    <StarIcon className="w-4 h-4 ml-2 text-yellow-400 flex-shrink-0" title="Suggested directory" />
                )}
            </div>
            {isExpanded && !isLoading && (
                <div>
                    {children.map(child => (
                        <TreeItem
                            key={child.path}
                            item={child}
                            level={level + 1}
                            token={token}
                            repo={repo}
                            onSelectPath={onSelectPath}
                            selectedPath={selectedPath}
                            suggestedPaths={suggestedPaths}
                        />
                    ))}
                    {children.length === 0 && (
                        <div style={{ paddingLeft: `${(level + 1) * 1.25 + 0.5}rem` }} className="py-1 text-gray-400 text-xs italic">
                            Empty folder
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface RepoFileTreeProps {
    token: string;
    repo: GithubRepo;
    onSelectPath: (path: string) => void;
    selectedPath: string;
    suggestedPaths?: string[];
}

export const RepoFileTree: React.FC<RepoFileTreeProps> = ({ token, repo, onSelectPath, selectedPath, suggestedPaths = [] }) => {
    const [rootItems, setRootItems] = useState<RepoTreeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRoot = async () => {
            setIsLoading(true);
            try {
                const items = await githubService.getRepoTree(token, repo.owner.login, repo.name, '');
                setRootItems(items);
            } catch (error) {
                console.error("Failed to fetch repo root:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoot();
    }, [token, repo]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <SpinnerIcon className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }
    
    return (
        <div className="space-y-1">
            {rootItems.map(item => (
                <TreeItem 
                    key={item.path} 
                    item={item} 
                    level={0} 
                    token={token} 
                    repo={repo} 
                    onSelectPath={onSelectPath}
                    selectedPath={selectedPath}
                    suggestedPaths={suggestedPaths}
                />
            ))}
        </div>
    );
};