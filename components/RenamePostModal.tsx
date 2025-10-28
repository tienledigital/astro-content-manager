import React, { useState, useEffect, useCallback } from 'react';
import { PostData } from './PostList';
import { slugify } from '../utils/parsing';
import { CloseIcon } from './icons/CloseIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface RenamePostModalProps {
    post: PostData;
    domainUrl: string;
    imagesPath: string;
    onClose: () => void;
    onSave: (post: PostData, newTitle: string, newSlug: string) => Promise<void>;
}

const RenamePostModal: React.FC<RenamePostModalProps> = ({ post, domainUrl, imagesPath, onClose, onSave }) => {
    const [title, setTitle] = useState(post.frontmatter.title || '');
    const [slug, setSlug] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);

    useEffect(() => {
        // Initialize slug from filename, removing extension
        const initialSlug = post.name.substring(0, post.name.lastIndexOf('.'));
        setSlug(initialSlug);
    }, [post.name]);
    
    useEffect(() => {
        if (!hasManuallyEditedSlug && title) {
            setSlug(slugify(title));
        }
    }, [title, hasManuallyEditedSlug]);
    
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasManuallyEditedSlug(true);
        setSlug(slugify(e.target.value));
    };

    const handleSaveClick = async () => {
        if (!title || !slug) {
            setError('Title and slug cannot be empty.');
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            await onSave(post, title, slug);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const getNewImageUrl = () => {
        const oldImageUrl = post.frontmatter.image;
        if (typeof oldImageUrl !== 'string') return 'N/A';
        const imageExt = oldImageUrl.split('.').pop() || 'jpg';
        const publicPath = imagesPath.startsWith('public/') ? imagesPath.substring('public/'.length) : imagesPath;
        return `/${publicPath}/${slug}.${imageExt}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Edit Post Details</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close modal">
                        <CloseIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </header>

                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
                        <input
                            type="text"
                            id="post-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="post-slug" className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                        <input
                            type="text"
                            id="post-slug"
                            value={slug}
                            onChange={handleSlugChange}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                    </div>
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600 space-y-1">
                        <p><strong>New Canonical URL:</strong> <code className="break-all">{domainUrl ? `${domainUrl.replace(/\/$/, '')}/${slug}` : 'Set domain in settings'}</code></p>
                        <p><strong>New Image Path:</strong> <code className="break-all">{getNewImageUrl()}</code></p>
                    </div>
                </main>

                <footer className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center space-x-3">
                    <button
                        onClick={onClose}
                        className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded border border-gray-300 transition duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveClick}
                        disabled={isSaving}
                        className="min-w-[100px] flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
                    >
                        {isSaving ? <SpinnerIcon className="animate-spin h-5 w-5" /> : 'Save Changes'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default RenamePostModal;