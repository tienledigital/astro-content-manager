import React, { useState, useEffect } from 'react';
import { GithubRepo, GithubContent } from '../types';
import * as githubService from '../services/githubService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { ImageIcon } from './icons/ImageIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { useI18n } from '../i18n/I18nContext';

// Declare JSZip from CDN
declare var JSZip: any;

interface BackupManagerProps {
    token: string;
    repo: GithubRepo;
    postsPath: string;
    imagesPath: string;
}

// A reusable card component for backup options
const BackupCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    buttonText: string;
    buttonIcon: React.ReactNode;
    loadingText: string;
    isLoading: boolean;
    error: string | null;
    success: string | null;
    onBackup: () => void;
    buttonColorClass: string;
}> = ({
    title,
    description,
    icon,
    buttonText,
    buttonIcon,
    loadingText,
    isLoading,
    error,
    success,
    onBackup,
    buttonColorClass,
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg">
            {icon}
            <h3 className="text-xl font-bold text-gray-800 mt-4">{title}</h3>
            <p className="text-gray-600 text-sm mt-2 mb-6 flex-grow">{description}</p>
            
            <div className="w-full h-16 flex items-center justify-center">
                {isLoading ? (
                    <div className="flex flex-col items-center text-sm text-gray-500">
                        <SpinnerIcon className="animate-spin h-6 w-6 text-gray-400" />
                        <span className="mt-2">{loadingText}</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-md w-full">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                ) : success ? (
                    <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-md w-full">
                        <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">{success}</span>
                    </div>
                ) : (
                    <button
                        onClick={onBackup}
                        disabled={isLoading}
                        className={`w-full flex justify-center items-center text-white font-bold py-2.5 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${buttonColorClass}`}
                    >
                        {buttonIcon}
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
    );
};


const BackupManager: React.FC<BackupManagerProps> = ({ token, repo, postsPath, imagesPath }) => {
    const [isBackingUpPosts, setIsBackingUpPosts] = useState(false);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [postsSuccess, setPostsSuccess] = useState<string | null>(null);

    const [isBackingUpImages, setIsBackingUpImages] = useState(false);
    const [imagesError, setImagesError] = useState<string | null>(null);
    const [imagesSuccess, setImagesSuccess] = useState<string | null>(null);
    const { t } = useI18n();
    
    // Effect to clear messages after a delay
    useEffect(() => {
        if (postsSuccess || postsError) {
            const timer = setTimeout(() => {
                setPostsSuccess(null);
                setPostsError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [postsSuccess, postsError]);

    useEffect(() => {
        if (imagesSuccess || imagesError) {
            const timer = setTimeout(() => {
                setImagesSuccess(null);
                setImagesError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [imagesSuccess, imagesError]);

    const handleBackup = async (
        path: string, 
        fileFilter: (item: GithubContent) => boolean,
        setIsLoading: (loading: boolean) => void,
        setError: (error: string | null) => void,
        setSuccess: (message: string | null) => void,
        backupType: 'posts' | 'images'
    ) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (typeof JSZip === 'undefined') throw new Error(t('backupManager.zipError'));

            const zip = new JSZip();
            const contents = await githubService.getRepoContents(token, repo.owner.login, repo.name, path);
            const filesToBackup = contents.filter(item => item.type === 'file' && fileFilter(item));

            if (filesToBackup.length === 0) {
                 setSuccess(t('backupManager.noFiles'));
                 setIsLoading(false);
                 return;
            }

            const fetchPromises = filesToBackup.map(async (file) => {
                const blob = await githubService.getFileAsBlob(token, repo.owner.login, repo.name, file.path);
                zip.file(file.name, blob);
            });
            
            await Promise.all(fetchPromises);

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            const date = new Date().toISOString().split('T')[0];
            link.download = `${repo.name}-${backupType}-backup-${date}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            setSuccess(t('backupManager.success', { count: filesToBackup.length }));

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage.length > 30 ? t('backupManager.error') : t('backupManager.errorDetail', { message: errorMessage }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BackupCard
                    title={t('backupManager.posts.title')}
                    description={t('backupManager.posts.description', { path: postsPath })}
                    icon={<DocumentIcon className="w-20 h-20 text-blue-500" />}
                    buttonText={t('backupManager.posts.button')}
                    buttonIcon={<DownloadIcon className="w-5 h-5 mr-2" />}
                    loadingText={t('backupManager.posts.zipping')}
                    isLoading={isBackingUpPosts}
                    error={postsError}
                    success={postsSuccess}
                    onBackup={() => handleBackup(
                        postsPath, 
                        (item) => item.name.endsWith('.md') || item.name.endsWith('.mdx'),
                        setIsBackingUpPosts, 
                        setPostsError, 
                        setPostsSuccess, 
                        'posts'
                    )}
                    buttonColorClass="bg-blue-600 hover:bg-blue-700"
                />
                
                <BackupCard
                    title={t('backupManager.images.title')}
                    description={t('backupManager.images.description', { path: imagesPath })}
                    icon={<ImageIcon className="w-20 h-20 text-purple-500" />}
                    buttonText={t('backupManager.images.button')}
                    buttonIcon={<DownloadIcon className="w-5 h-5 mr-2" />}
                    loadingText={t('backupManager.images.zipping')}
                    isLoading={isBackingUpImages}
                    error={imagesError}
                    success={imagesSuccess}
                    onBackup={() => handleBackup(
                        imagesPath, 
                        () => true, // Backup all files in the directory
                        setIsBackingUpImages, 
                        setImagesError, 
                        setImagesSuccess, 
                        'images'
                    )}
                    buttonColorClass="bg-purple-600 hover:bg-purple-700"
                />
            </div>
        </div>
    );
};

export default BackupManager;