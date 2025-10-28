import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { useI18n } from '../i18n/I18nContext';

interface FileUploaderProps {
  uploadFunction: (file: File) => Promise<void>;
  acceptedFileTypes: string;
  title: string;
  description: string;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ uploadFunction, acceptedFileTypes, title, description, disabled = false }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { t } = useI18n();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleUpload = useCallback(async () => {
    if (!selectedFile || disabled) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await uploadFunction(selectedFile);
      setSuccessMessage(t('fileUploader.success', { name: selectedFile.name }));
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('fileUploader.error'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, uploadFunction, disabled, t]);

  return (
    <div className={`mt-4 space-y-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className={`relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors bg-white ${disabled ? 'cursor-not-allowed' : 'hover:border-blue-500'}`}>
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <label htmlFor={`file-upload-${title.replace(/\s+/g, '-')}`} className={`relative ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <span className="text-blue-600 font-semibold">{title}</span>
          <p className="text-xs text-gray-500">{description}</p>
        </label>
        <input 
          id={`file-upload-${title.replace(/\s+/g, '-')}`} 
          name="file-upload" 
          type="file" 
          className="sr-only" 
          accept={acceptedFileTypes} 
          onChange={handleFileChange} 
          disabled={disabled}
        />
      </div>
      
      {selectedFile && (
        <div className="text-sm text-gray-600">
          {t('fileUploader.selected')} <span className="font-medium text-gray-900">{selectedFile.name}</span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || isLoading || disabled}
        className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            {t('fileUploader.uploading')}
          </>
        ) : (
          t('fileUploader.uploadButton')
        )}
      </button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}
    </div>
  );
};

export default FileUploader;