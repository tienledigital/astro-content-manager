import React, { useState } from 'react';
import { GithubRepo } from '../types';
import FileUploader from './FileUploader';
import DirectoryPicker from './DirectoryPicker';
import * as githubService from '../services/githubService';
import { BackIcon } from './icons/BackIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { ImageIcon } from './icons/ImageIcon';

interface ContentUploaderProps {
  token: string;
  repo: GithubRepo;
  onBack: () => void;
}

const ContentUploader: React.FC<ContentUploaderProps> = ({ token, repo, onBack }) => {
  const [postsPath, setPostsPath] = useState('');
  const [imagesPath, setImagesPath] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const [isPostsPickerOpen, setIsPostsPickerOpen] = useState(false);
  const [isImagesPickerOpen, setIsImagesPickerOpen] = useState(false);
  
  // Hardcoded file types as per project configuration
  const postFileTypes = '.md,.mdx';
  const imageFileTypes = 'image/*';

  const handleUpload = async (path: string, file: File) => {
    const fullPath = path ? `${path}/${file.name}` : file.name;
    const commitMessage = `feat: add '${file.name}' via Astro Content Manager`;
    await githubService.uploadFile(token, repo.owner.login, repo.name, fullPath, file, commitMessage);
    if (path === imagesPath) {
      const publicPath = imagesPath.startsWith('public/') ? imagesPath.substring('public/'.length) : imagesPath;
      const finalImagePath = publicPath ? `/${publicPath}/${file.name}` : `/${file.name}`;
      setUploadedImageUrl(`![alt text](${finalImagePath})`);
    }
  };

  return (
    <div>
       {isPostsPickerOpen && (
        <DirectoryPicker
          token={token}
          repo={repo}
          onClose={() => setIsPostsPickerOpen(false)}
          onSelect={(path) => {
            setPostsPath(path);
            setIsPostsPickerOpen(false);
          }}
          initialPath={postsPath}
        />
      )}
      {isImagesPickerOpen && (
        <DirectoryPicker
          token={token}
          repo={repo}
          onClose={() => setIsImagesPickerOpen(false)}
          onSelect={(path) => {
            setImagesPath(path);
            setIsImagesPickerOpen(false);
          }}
          initialPath={imagesPath}
        />
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex-grow">
          <h2 className="text-2xl font-bold text-gray-900">Managing: {repo.full_name}</h2>
          <p className="text-gray-600">Upload new posts and images to your project.</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button onClick={onBack} className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-200">
            <BackIcon className="w-5 h-5 mr-2" />
            Change Repo
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Posts Uploader */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
          <h3 className="flex items-center text-xl font-semibold mb-4 text-gray-900">
            <DocumentIcon className="w-6 h-6 mr-3 text-blue-500" />
            Upload New Post
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Posts Directory</label>
            <div className="flex items-center justify-between p-2 bg-white border border-gray-300 rounded-md">
                <code className="text-sm text-gray-700 truncate">{postsPath || '/ (root)'}</code>
                <button onClick={() => setIsPostsPickerOpen(true)} className="ml-2 flex-shrink-0 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded">
                    Change
                </button>
            </div>
          </div>
          <FileUploader
            uploadFunction={(file) => handleUpload(postsPath, file)}
            acceptedFileTypes={postFileTypes}
            title="Select Post File"
            description={`Allowed types: ${postFileTypes}`}
          />
        </div>

        {/* Images Uploader */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
          <h3 className="flex items-center text-xl font-semibold mb-4 text-gray-900">
            <ImageIcon className="w-6 h-6 mr-3 text-purple-500" />
            Upload Image
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Images Directory</label>
             <div className="flex items-center justify-between p-2 bg-white border border-gray-300 rounded-md">
                <code className="text-sm text-gray-700 truncate">{imagesPath || '/ (root)'}</code>
                <button onClick={() => setIsImagesPickerOpen(true)} className="ml-2 flex-shrink-0 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded">
                    Change
                </button>
            </div>
          </div>
          <FileUploader
            uploadFunction={(file) => handleUpload(imagesPath, file)}
            acceptedFileTypes={imageFileTypes}
            title="Select Image File"
            description={`Allowed types: ${imageFileTypes}`}
          />
          {uploadedImageUrl && (
            <div className="mt-4 p-3 bg-gray-100 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-600 mb-2">Image Markdown Snippet:</p>
                <input
                    type="text"
                    readOnly
                    value={uploadedImageUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full bg-gray-200 text-green-700 px-2 py-1 rounded-md text-xs font-mono cursor-pointer border border-gray-300"
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentUploader;