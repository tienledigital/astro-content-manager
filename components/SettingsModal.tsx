import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (postTypes: string, imageTypes: string) => void;
  initialPostTypes: string;
  initialImageTypes: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPostTypes,
  initialImageTypes,
}) => {
  const [postTypes, setPostTypes] = useState(initialPostTypes);
  const [imageTypes, setImageTypes] = useState(initialImageTypes);

  useEffect(() => {
    setPostTypes(initialPostTypes);
    setImageTypes(initialImageTypes);
  }, [initialPostTypes, initialImageTypes, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(postTypes, imageTypes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <header className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">File Type Settings</h3>
          <p className="text-sm text-gray-500">Configure the accepted file types for uploads.</p>
        </header>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="post-types" className="block text-sm font-medium text-gray-700 mb-1">
              Post File Types
            </label>
            <input
              type="text"
              id="post-types"
              value={postTypes}
              onChange={(e) => setPostTypes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=".md,.mdx"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated list of file extensions or MIME types.
            </p>
          </div>
          <div>
            <label htmlFor="image-types" className="block text-sm font-medium text-gray-700 mb-1">
              Image File Types
            </label>
            <input
              type="text"
              id="image-types"
              value={imageTypes}
              onChange={(e) => setImageTypes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="image/*,.webp"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: <code>image/*</code> for all image types.
            </p>
          </div>
        </div>
        <footer className="p-4 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="mr-2 bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded border border-gray-300 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Save Settings
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;
