import React, { useState, useEffect, useCallback } from 'react';
import { GithubRepo, GithubContent } from '../types';
import * as githubService from '../services/githubService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SearchIcon } from './icons/SearchIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useI18n } from '../i18n/I18nContext';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ImageIcon } from './icons/ImageIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ImageListProps {
  token: string;
  repo: GithubRepo;
  path: string;
  imageFileTypes: string;
  domainUrl: string;
  projectType: 'astro' | 'github';
}

const IMAGES_PER_PAGE = 15;

const isImageFile = (filename: string, acceptedTypes: string): boolean => {
    const lowerFilename = filename.toLowerCase();
    const commonImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];

    if (acceptedTypes.trim() === 'image/*') {
        return commonImageExtensions.some(ext => lowerFilename.endsWith(ext));
    }

    const allowedExtensions = acceptedTypes.split(',').map(t => t.trim().toLowerCase()).filter(t => t.startsWith('.'));
    if (allowedExtensions.length === 0) {
        // Fallback if user provides MIME types instead of extensions
        return commonImageExtensions.some(ext => lowerFilename.endsWith(ext));
    }
    return allowedExtensions.some(ext => lowerFilename.endsWith(ext));
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ImageWithAuth: React.FC<{ token: string, repo: GithubRepo, image: GithubContent, className?: string }> = ({ token, repo, image, className }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        let objectUrl: string | null = null;

        const fetchBlob = async () => {
            setIsLoading(true);
            try {
                const blob = await githubService.getFileAsBlob(token, repo.owner.login, repo.name, image.path);
                if (isMounted) {
                    objectUrl = URL.createObjectURL(blob);
                    setImageUrl(objectUrl);
                }
            } catch (e) {
                console.error(`Failed to fetch blob for ${image.path}`, e);
                if (isMounted) setImageUrl(null);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchBlob();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [token, repo, image.path]);

    if (isLoading) {
        return <div className="flex items-center justify-center w-full h-full"><SpinnerIcon className="w-6 h-6 animate-spin text-gray-400" /></div>;
    }

    if (!imageUrl) {
        return <div className="flex items-center justify-center w-full h-full"><ImageIcon className="h-8 w-8 text-gray-300" /></div>;
    }

    return <img src={imageUrl} alt={image.name} className={className} />;
};

const ImageList: React.FC<ImageListProps> = ({ token, repo, path, imageFileTypes, domainUrl, projectType }) => {
    const [images, setImages] = useState<GithubContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useI18n();
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const fetchImages = useCallback(async () => {
        if (!path) {
            setImages([]);
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            const items = await githubService.getRepoContents(token, repo.owner.login, repo.name, path);
            const imageFiles = items.filter(item => item.type === 'file' && isImageFile(item.name, imageFileTypes));
            
            imageFiles.sort((a,b) => a.name.localeCompare(b.name));
            setImages(imageFiles);
            setCurrentPage(1);

        } catch (err) {
            if (err instanceof Error && err.message.includes('404')) {
                setError(t('imageList.error.dirNotFound', { path }));
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch images.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [token, repo, path, imageFileTypes, t]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleDeleteClick = async (image: GithubContent) => {
        if (window.confirm(t('imageList.deleteConfirm', { name: image.name }))) {
            setIsDeleting(image.sha);
            setError(null);
            try {
                const commitMessage = `chore: delete image "${image.name}"`;
                await githubService.deleteFile(token, repo.owner.login, repo.name, image.path, image.sha, commitMessage);
                await fetchImages();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete image.');
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const resolveImageUrl = (image: GithubContent): string => {
      if (projectType === 'github') {
        // For private repos, we use blobs. For public, direct URL.
        if (repo.private) return ''; // Handled by ImageWithAuth component
        return `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/${image.path}`;
      }

      // Astro/Next.js logic
      let publicPath = image.path;
      if (publicPath.startsWith('public/')) {
        publicPath = `/${publicPath.substring('public/'.length)}`;
      } else if (publicPath === 'public') {
        publicPath = ''; // Root of public
      } else if (!publicPath.startsWith('/')) {
        publicPath = `/${publicPath}`;
      }
      return `${domainUrl.replace(/\/$/, '')}${publicPath}`;
    };

    const filteredImages = images.filter(image => 
        image.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredImages.length / IMAGES_PER_PAGE);
    const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
    const endIndex = startIndex + IMAGES_PER_PAGE;
    const currentImages = filteredImages.slice(startIndex, endIndex);

    if (projectType !== 'github' && !domainUrl) {
        return (
            <div className="text-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-500" />
                <h3 className="mt-4 text-xl font-bold text-gray-800">{t('imageList.error.domainNotSetTitle')}</h3>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">{t('imageList.error.domainNotSetDescription')}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <SpinnerIcon className="animate-spin h-8 w-8 text-blue-600" />
                <span className="ml-4 text-gray-600">{t('imageList.loading')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 border-l-4 border-red-400 bg-red-50 text-left">
                <h4 className="font-bold text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
        );
    }

    if (images.length === 0) {
        return <p className="text-center text-gray-500 p-4">{t('imageList.noImages')}</p>;
    }

    return (
        <>
            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder={t('imageList.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
            </div>

            {projectType === 'github' ? (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
                    <h4 className="font-bold">{t('imageList.infoBanner.title')}</h4>
                    <p className="text-sm mt-1">{t('imageList.infoBanner.description')}</p>
                </div>
            ) : (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-800">
                    <h4 className="font-bold">{t('imageList.infoBannerWeb.title')}</h4>
                    <p className="text-sm mt-1">{t('imageList.infoBannerWeb.description')}</p>
                </div>
            )}


            {filteredImages.length === 0 ? (
                <p className="text-center text-gray-500 p-4">{t('imageList.noResults')}</p>
            ) : (
                <>
                    <div className="space-y-3">
                        {currentImages.map((image) => {
                            const imageUrl = resolveImageUrl(image);
                            return (
                                <div key={image.sha} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-grow min-w-0">
                                        <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center">
                                            {projectType === 'github' && repo.private ? (
                                                <ImageWithAuth token={token} repo={repo} image={image} className="w-full h-full object-cover rounded-md" />
                                            ) : !imageErrors[image.sha] ? (
                                                <img src={imageUrl} alt={image.name} className="w-full h-full object-cover rounded-md" onError={() => setImageErrors(prev => ({...prev, [image.sha]: true}))} />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{image.name}</p>
                                            <p className="text-xs text-gray-500">{formatBytes(image.size)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {(projectType !== 'github' || !repo.private) && (
                                            <button
                                                onClick={() => handleCopyUrl(imageUrl)}
                                                className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1.5 px-3 rounded-md transition duration-200 text-xs w-28 justify-center"
                                            >
                                                {copiedUrl === imageUrl ? (
                                                    <>
                                                        <CheckCircleIcon className="w-4 h-4 mr-1.5 text-green-500" />
                                                        {t('imageList.urlCopied')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <ClipboardIcon className="w-4 h-4 mr-1.5" />
                                                        {t('imageList.copyUrlButton')}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteClick(image)}
                                            disabled={!!isDeleting}
                                            className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 disabled:opacity-50"
                                            title={t('imageList.delete')}
                                        >
                                            {isDeleting === image.sha ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <TrashIcon className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center space-x-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                {t('imageList.pagination.prev')}
                            </button>
                            <span className="text-sm text-gray-700">
                                {t('imageList.pagination.pageInfo', { current: currentPage, total: totalPages })}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                {t('imageList.pagination.next')}
                            </button>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default ImageList;