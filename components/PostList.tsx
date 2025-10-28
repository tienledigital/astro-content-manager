import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GithubRepo } from '../types';
import * as githubService from '../services/githubService';
import { parseMarkdown, updateFrontmatter, ParsedMarkdown } from '../utils/parsing';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ImageIcon } from './icons/ImageIcon';
import { EditIcon } from './icons/EditIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { TrashIcon } from './icons/TrashIcon';
import PostPreviewModal from './PostPreviewModal';
import { SearchIcon } from './icons/SearchIcon';
import { useI18n } from '../i18n/I18nContext';


interface PostListProps {
  token: string;
  repo: GithubRepo;
  path: string;
  imagesPath: string;
  onPostUpdate: (filePath: string, file: File) => Promise<void>;
  postFileTypes: string;
  imageFileTypes: string;
  newImageCommitTemplate: string;
  updatePostCommitTemplate: string;
}

export interface PostData extends ParsedMarkdown {
  sha: string;
  name: string;
  html_url: string;
  path: string;
  rawContent: string;
}

const POSTS_PER_PAGE = 20;

const PostList: React.FC<PostListProps> = ({ 
    token, repo, path, imagesPath, onPostUpdate, 
    postFileTypes, imageFileTypes, newImageCommitTemplate, updatePostCommitTemplate 
}) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useI18n();

  const mdFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  
  const [editingPost, setEditingPost] = useState<PostData | null>(null);
  const [changingImageForPost, setChangingImageForPost] = useState<PostData | null>(null);
  const [postToPreview, setPostToPreview] = useState<PostData | null>(null);


  const fetchPosts = useCallback(async () => {
    if (!path) {
      setPosts([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const items = await githubService.getRepoContents(token, repo.owner.login, repo.name, path);
      const postFiles = items.filter(item => item.type === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.mdx')));

      const postsData = await Promise.all(
        postFiles.map(async (file) => {
          try {
              const content = await githubService.getFileContent(token, repo.owner.login, repo.name, file.path);
              const parsed = parseMarkdown(content);
              return {
                  ...parsed,
                  sha: file.sha,
                  name: file.name,
                  html_url: file.html_url,
                  path: file.path,
                  rawContent: content,
              };
          } catch(e) {
              console.error(`Failed to process file ${file.path}:`, e);
              return null;
          }
        })
      );
      
      const validPosts = postsData.filter((p): p is PostData => p !== null);
      validPosts.sort((a,b) => {
        const dateA = a.frontmatter.publishDate || a.frontmatter.date || 'a';
        const dateB = b.frontmatter.publishDate || b.frontmatter.date || 'b';
        return dateB.localeCompare(dateA);
      });
      setPosts(validPosts);
      setCurrentPage(1);

    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        setError(t('postList.error.dirNotFound', { path }));
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, repo, path, t]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleEditClick = (post: PostData) => {
    setEditingPost(post);
    mdFileInputRef.current?.click();
  };

  const handleMdFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editingPost) {
      setIsUpdating(editingPost.sha);
      setError(null);
      try {
        await onPostUpdate(editingPost.path, file);
        await fetchPosts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update post.');
      } finally {
        setIsUpdating(null);
        setEditingPost(null);
        if (mdFileInputRef.current) {
          mdFileInputRef.current.value = '';
        }
      }
    }
  };

  const handleChangeImageClick = (post: PostData) => {
    setChangingImageForPost(post);
    imageFileInputRef.current?.click();
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0];
    if (!imageFile || !changingImageForPost) return;

    setIsUpdating(changingImageForPost.sha);
    setError(null);

    try {
      const imageCommitMessage = newImageCommitTemplate.replace('{filename}', imageFile.name);
      const fullImagePath = imagesPath ? `${imagesPath}/${imageFile.name}` : imageFile.name;
      await githubService.uploadFile(token, repo.owner.login, repo.name, fullImagePath, imageFile, imageCommitMessage);

      const publicPath = imagesPath.startsWith('public/') ? imagesPath.substring('public/'.length) : imagesPath;
      const newImageUrl = publicPath ? `/${publicPath}/${imageFile.name}` : `/${imageFile.name}`;

      const newContent = updateFrontmatter(changingImageForPost.rawContent, { image: newImageUrl });

      const postUpdateCommitMessage = updatePostCommitTemplate.replace('{filename}', changingImageForPost.name);
      await githubService.updateFileContent(token, repo.owner.login, repo.name, changingImageForPost.path, newContent, postUpdateCommitMessage, changingImageForPost.sha);

      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post image.');
    } finally {
      setIsUpdating(null);
      setChangingImageForPost(null);
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteClick = async (post: PostData) => {
    if (window.confirm(t('postList.deleteConfirm', { name: post.name }))) {
        setIsUpdating(post.sha);
        setError(null);
        try {
            const commitMessage = `chore: delete post "${post.name}"`;
            await githubService.deleteFile(token, repo.owner.login, repo.name, post.path, post.sha, commitMessage);
            setPostToPreview(null);
            await fetchPosts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete post.');
        } finally {
            setIsUpdating(null);
        }
    }
  };

  const resolveImageUrl = (thumbnailUrl: string | null) => {
      if (!thumbnailUrl) return null;
      if (thumbnailUrl.startsWith('http')) return thumbnailUrl;
      if (thumbnailUrl.startsWith('/')) {
        return `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/public${thumbnailUrl}`;
      }
      return `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/${path}/${thumbnailUrl}`;
  }

  const renderValue = (key: string, value: any) => {
    if (Array.isArray(value) && value.length > 0) {
        return (
            <div className="flex flex-wrap gap-1 items-center">
                {value.map((tag, index) => (
                    <span key={`${key}-${index}`} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {String(tag)}
                    </span>
                ))}
            </div>
        );
    }
    return <span className="text-gray-600 break-words">{String(value)}</span>;
  };
  
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    const titleMatch = post.frontmatter.title?.toLowerCase().includes(query);
    const filenameMatch = post.name.toLowerCase().includes(query);
    const authorMatch = post.frontmatter.author?.toLowerCase().includes(query);
    const categoryMatch = post.frontmatter.category?.toLowerCase().includes(query);
    
    const tagsMatch = Array.isArray(post.frontmatter.tags) && 
                      post.frontmatter.tags.some(tag => 
                        String(tag).toLowerCase().includes(query)
                      );
                      
    return titleMatch || filenameMatch || authorMatch || categoryMatch || tagsMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <SpinnerIcon className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-4 text-gray-600">{t('postList.loading')}</span>
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
  
  if (posts.length === 0) {
      return <p className="text-center text-gray-500 p-4">{t('postList.noPosts')}</p>;
  }

  return (
    <>
      <input type="file" ref={mdFileInputRef} onChange={handleMdFileChange} accept={postFileTypes} className="hidden"/>
      <input type="file" ref={imageFileInputRef} onChange={handleImageFileChange} accept={imageFileTypes} className="hidden" />
      {postToPreview && <PostPreviewModal post={postToPreview} onClose={() => setPostToPreview(null)} onDelete={handleDeleteClick} />}

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder={t('postList.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-500 p-4">{t('postList.noResults')}</p>
      ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {currentPosts.map((post) => {
              const postDateRaw = post.frontmatter.publishDate || post.frontmatter.date || post.frontmatter.pubDate;
              const postDate = postDateRaw ? new Date(postDateRaw).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;
              const author = post.frontmatter.author;

              const otherFrontmatter = Object.entries(post.frontmatter)
                .filter(([key]) => 
                  !['title', 'image', 'thumbnail', 'cover', 'date', 'publishdate', 'pubdate', 'author', 'excerpt', 'category', 'tags', 'metadata'].includes(key.toLowerCase())
                );

              return (
              <div key={post.sha} className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                  <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {post.thumbnailUrl ? (
                          <img src={resolveImageUrl(post.thumbnailUrl) || ''} alt={post.frontmatter.title || 'Thumbnail'} className="h-full w-full object-cover" />
                      ) : (
                          <ImageIcon className="h-10 w-10 text-gray-300" />
                      )}
                      {isUpdating === post.sha && (
                          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                              <SpinnerIcon className="h-8 w-8 animate-spin text-blue-600" />
                          </div>
                      )}
                  </div>

                  <div className="grid grid-cols-2 border-b border-t border-gray-200 divide-x divide-gray-200">
                      <button onClick={() => handleChangeImageClick(post)} disabled={!!isUpdating} className="flex items-center justify-center text-xs font-medium p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:z-10" title={t('postList.updateImage')}>
                          <PhotoIcon className="w-4 h-4 mr-1.5" />
                          {t('postList.updateImage')}
                      </button>
                      <button onClick={() => handleEditClick(post)} disabled={!!isUpdating} className="flex items-center justify-center text-xs font-medium p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10" title={t('postList.updateFile')}>
                          <EditIcon className="w-4 h-4 mr-1.5" />
                          {t('postList.updateFile')}
                      </button>
                  </div>

                  <div className="p-4 flex-grow flex flex-col">
                      <button onClick={() => setPostToPreview(post)} className="font-bold text-base text-gray-800 hover:text-blue-600 leading-tight text-left break-words">
                          {post.frontmatter.title || post.name}
                      </button>
                      
                      <div className="text-xs text-gray-500 mt-1 mb-2">
                          {author && <span>{t('postList.by')} <strong>{author}</strong></span>}
                          {author && postDate && <span className="mx-1">·</span>}
                          {postDate && <span>{postDate}</span>}
                      </div>

                      <div className="text-xs text-gray-700 space-y-2 mt-auto pt-3 border-t border-gray-100">
                          {post.frontmatter.category && (
                              <div className="grid grid-cols-3 gap-1 items-start">
                                  <span className="font-semibold capitalize col-span-1">{t('postList.category')}:</span>
                                  <div className="col-span-2">{renderValue('category', post.frontmatter.category)}</div>
                              </div>
                          )}
                          {post.frontmatter.tags && Array.isArray(post.frontmatter.tags) && post.frontmatter.tags.length > 0 && (
                              <div className="grid grid-cols-3 gap-1 items-start">
                                  <span className="font-semibold capitalize col-span-1">{t('postList.tags')}:</span>
                                  <div className="col-span-2">
                                      <div className="flex flex-wrap gap-1 items-center">
                                          {post.frontmatter.tags.slice(0, 2).map((tag, index) => (
                                              <span key={`tag-${index}`} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                  {String(tag)}
                                              </span>
                                          ))}
                                          {post.frontmatter.tags.length > 2 && (
                                              <span className="text-gray-500 text-xs font-medium ml-1">{t('postList.more', { count: post.frontmatter.tags.length - 2 })}</span>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          )}
                          {otherFrontmatter.map(([key, value]) => (
                              <div key={key} className="grid grid-cols-3 gap-1 items-start">
                                  <span className="font-semibold capitalize col-span-1">{key}:</span>
                                  <div className="col-span-2">{renderValue(key, value)}</div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )})}
        </div>
        
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('postList.pagination.prev')}
            </button>
            <span className="text-sm text-gray-700">
              {t('postList.pagination.pageInfo', { current: currentPage, total: totalPages })}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('postList.pagination.next')}
            </button>
          </div>
        )}
      </>
      )}
    </>
  );
};

export default PostList;