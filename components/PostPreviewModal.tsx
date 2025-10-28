import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useI18n } from '../i18n/I18nContext';

// Declare global variables from CDN scripts
declare global {
  interface Window {
    marked: {
      parse: (markdown: string) => string;
    };
    DOMPurify: {
      sanitize: (html: string) => string;
    };
  }
}

interface PostData {
  frontmatter: Record<string, any>;
  body: string;
  rawContent: string;
  name: string;
}

interface PostPreviewModalProps {
  post: PostData;
  onClose: () => void;
  onDelete: (post: PostData) => void;
}

const PostPreviewModal: React.FC<PostPreviewModalProps> = ({ post, onClose, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'preview' | 'code'>('metadata');
  const { t } = useI18n();

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const createMarkup = (markdownContent: string) => {
    if (window.marked && window.DOMPurify) {
      const rawMarkup = window.marked.parse(markdownContent);
      const sanitizedMarkup = window.DOMPurify.sanitize(rawMarkup);
      return { __html: sanitizedMarkup };
    }
    return { __html: '<p>Preview library not loaded.</p>' };
  };
  
  const renderMetadataValue = (key: string, value: any) => {
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span key={`${key}-${index}`} className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {String(item)}
            </span>
          ))}
        </div>
      );
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return (
            <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-3">
                {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey} className="grid grid-cols-1 sm:grid-cols-3 gap-1 items-start">
                        <dt className="text-xs font-semibold text-gray-500 capitalize sm:col-span-1">
                            {subKey}:
                        </dt>
                        <dd className="text-sm text-gray-900 sm:col-span-2">
                            {renderMetadataValue(subKey, subValue)}
                        </dd>
                    </div>
                ))}
            </div>
        );
    }
    if (typeof value === 'string' && value.startsWith('http')) {
        return <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{value}</a>
    }
    return <span className="text-gray-900 break-all">{String(value)}</span>;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800 truncate" title={post.frontmatter.title || post.name}>
            {post.frontmatter.title || post.name}
          </h3>
          <div className="flex items-center space-x-2">
            <button
                onClick={() => onDelete(post)}
                className="inline-flex items-center bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-1 px-3 rounded-md transition duration-200 text-sm"
                aria-label="Delete post"
            >
                <TrashIcon className="w-4 h-4 mr-1.5" />
                {t('postPreview.delete')}
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close modal">
              <CloseIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </header>

        <nav className="border-b border-gray-200 flex-shrink-0">
          <div className="px-4 flex space-x-4">
             <button
              onClick={() => setActiveTab('metadata')}
              className={`py-2 px-3 font-medium text-sm border-b-2 ${
                activeTab === 'metadata'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('postPreview.tabMetadata')}
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-2 px-3 font-medium text-sm border-b-2 ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('postPreview.tabPreview')}
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`py-2 px-3 font-medium text-sm border-b-2 ${
                activeTab === 'code'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('postPreview.tabMarkdown')}
            </button>
          </div>
        </nav>

        <main className="p-4 sm:p-6 overflow-y-auto flex-grow bg-gray-50">
          {activeTab === 'metadata' ? (
             <div className="bg-white p-4 sm:p-6 border border-gray-200 rounded-md">
              <dl className="space-y-4">
                {Object.entries(post.frontmatter).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
                    <dt className="text-sm font-medium text-gray-500 capitalize md:col-span-1">{key}:</dt>
                    <dd className="text-sm text-gray-900 md:col-span-3">{renderMetadataValue(key, value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : activeTab === 'preview' ? (
            <div
              className="prose prose-sm sm:prose-base max-w-none markdown-preview bg-white p-4 sm:p-6 border border-gray-200 rounded-md"
              dangerouslySetInnerHTML={createMarkup(post.body)}
            />
          ) : (
            <pre className="whitespace-pre-wrap bg-gray-900 text-white p-4 rounded-md text-sm font-mono h-full">
              <code>{post.rawContent}</code>
            </pre>
          )}
        </main>
      </div>
    </div>
  );
};

export default PostPreviewModal;