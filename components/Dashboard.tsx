import React, { useState, useEffect, useRef } from 'react';
import { GithubRepo } from '../types';
import PostList from './PostList';
import NewPostCreator from './NewPostCreator';
import ImageList from './ImageList';
import DirectoryPicker from './DirectoryPicker';
import * as githubService from '../services/githubService';
import { DocumentIcon } from './icons/DocumentIcon';
import { ListIcon } from './icons/ListIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { FolderIcon } from './icons/FolderIcon';
import { PencilIcon } from './icons/PencilIcon';
import { InfoIcon } from './icons/InfoIcon';
import { ImageIcon } from './icons/ImageIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { GithubIcon } from './icons/GithubIcon';
import BackupManager from './BackupManager';
import TemplateGenerator from './TemplateGenerator';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import GuideModal from './GuideModal';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { useI18n } from '../i18n/I18nContext';
import { MenuIcon } from './icons/MenuIcon';
import { LinkIcon } from './icons/LinkIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { RepoFileTree } from './RepoFileTree';
import { AstroIcon } from './icons/AstroIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface DashboardProps {
  token: string;
  repo: GithubRepo;
  onResetAndLogout: () => void;
}

type ProjectType = 'astro' | 'github';

interface Settings {
  projectType: ProjectType;
  postsPath: string;
  imagesPath: string;
  domainUrl: string;
  postFileTypes: string;
  imageFileTypes: string;
  publishDateSource: 'file' | 'system';
  imageCompressionEnabled: boolean;
  maxImageSize: number;
  imageResizeMaxWidth: number;
  newPostCommit: string;
  updatePostCommit: string;
  newImageCommit: string;
  updateImageCommit: string;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center">
        <div className="bg-gray-100 rounded-full p-3 mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ token, repo, onResetAndLogout }) => {
  const [settings, setSettings] = useState<Settings>({
    projectType: 'astro',
    postsPath: '',
    imagesPath: 'public/images',
    domainUrl: '',
    postFileTypes: '.md,.mdx',
    imageFileTypes: 'image/*',
    publishDateSource: 'file',
    imageCompressionEnabled: false,
    maxImageSize: 2,
    imageResizeMaxWidth: 0,
    newPostCommit: 'feat(content): add post "{filename}"',
    updatePostCommit: 'fix(content): update post "{filename}"',
    newImageCommit: 'feat(assets): add image "{filename}"',
    updateImageCommit: 'refactor(assets): update image for "{filename}"',
  });
  
  const [activeTab, setActiveTab] = useState<'manage' | 'create' | 'manage-images' | 'backup' | 'template' | 'settings'>('manage');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isPostsPickerOpen, setIsPostsPickerOpen] = useState(false);
  const [isImagesPickerOpen, setIsImagesPickerOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  
  const [repoStats, setRepoStats] = useState<{postCount: number | null, imageCount: number | null}>({ postCount: null, imageCount: null });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isScanning, setIsScanning] = useState(true);
  const [suggestedPostPaths, setSuggestedPostPaths] = useState<string[]>([]);
  const [suggestedImagePaths, setSuggestedImagePaths] = useState<string[]>([]);
  const { t, language } = useI18n();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load settings and scan for content/domain on mount
  useEffect(() => {
    const loadSettingsAndScan = async () => {
      setIsScanning(true);
      const projectTypeKey = `projectType_${repo.full_name}`;
      const postsPathKey = `postsPath_${repo.full_name}`;
      const imagesPathKey = `imagesPath_${repo.full_name}`;
      
      const savedProjectType = localStorage.getItem(projectTypeKey) as ProjectType | null;
      const savedPostsPath = localStorage.getItem(postsPathKey);
      const savedImagesPath = localStorage.getItem(imagesPathKey);

      const loadedSettings: Partial<Settings> = {};
      const keys: (keyof Settings)[] = [
        'projectType', 'postsPath', 'imagesPath', 'domainUrl', 'postFileTypes', 'imageFileTypes',
        'publishDateSource', 'imageCompressionEnabled', 'maxImageSize', 'imageResizeMaxWidth',
        'newPostCommit', 'updatePostCommit', 'newImageCommit', 'updateImageCommit'
      ];

       keys.forEach(key => {
        let storageKey = ['projectType', 'postsPath', 'imagesPath', 'domainUrl'].includes(key)
          ? `${key}_${repo.full_name}`
          : key;
        const value = localStorage.getItem(storageKey);
        if (value !== null) {
          if (key === 'imageCompressionEnabled') (loadedSettings as any)[key] = value === 'true';
          else if (key === 'maxImageSize' || key === 'imageResizeMaxWidth') (loadedSettings as any)[key] = Number(value);
          else (loadedSettings as any)[key] = value;
        }
      });
       setSettings(prev => ({ ...prev, ...loadedSettings }));


      if (savedProjectType && savedPostsPath && savedImagesPath) {
        setIsSetupComplete(true);
      } else {
        // Run scans for setup screen
        const [foundUrl, contentDirs, imageDirs] = await Promise.all([
            githubService.findProductionUrl(token, repo.owner.login, repo.name),
            githubService.scanForContentDirectories(token, repo.owner.login, repo.name),
            githubService.scanForImageDirectories(token, repo.owner.login, repo.name),
        ]);
        
        if (foundUrl) {
          setSettings(prev => ({ ...prev, domainUrl: foundUrl }));
        }
        setSuggestedPostPaths(contentDirs);
        if (contentDirs.length > 0) {
            setSettings(prev => ({...prev, postsPath: contentDirs[0]}));
        }
        setSuggestedImagePaths(imageDirs);
        if (imageDirs.length > 0) {
            setSettings(prev => ({...prev, imagesPath: imageDirs[0]}));
        }
      }
      setIsScanning(false);
    };

    loadSettingsAndScan();
  }, [repo.full_name, repo.owner.login, repo.name, token]);

  useEffect(() => {
    if (isSetupComplete) {
        const fetchStats = async () => {
            setRepoStats({ postCount: null, imageCount: null });
            try {
                const postContents = await githubService.getRepoContents(token, repo.owner.login, repo.name, settings.postsPath);
                const postCount = postContents.filter(item => item.type === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.mdx'))).length;
                
                let imageCount = 0;
                try {
                    const imageContents = await githubService.getRepoContents(token, repo.owner.login, repo.name, settings.imagesPath);
                    imageCount = imageContents.filter(item => item.type === 'file').length;
                } catch (imgError) {
                    console.warn(`Could not fetch image stats from '${settings.imagesPath}':`, imgError);
                }

                setRepoStats({ postCount, imageCount });
            } catch (err) {
                console.error("Failed to fetch repo stats:", err);
            }
        };
        fetchStats();
    }
  }, [token, repo, settings.postsPath, settings.imagesPath, isSetupComplete]);

  const handleSettingsChange = (field: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({...prev, [field]: value}));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
        const keys: (keyof Settings)[] = Object.keys(settings) as (keyof Settings)[];
        keys.forEach(key => {
            let storageKey = ['projectType', 'postsPath', 'imagesPath', 'domainUrl'].includes(key)
            ? `${key}_${repo.full_name}`
            : key;
            localStorage.setItem(storageKey, String(settings[key]));
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
        console.error("Failed to save settings:", e);
    } finally {
        setIsSaving(false);
    }
  };

  const handleFinishSetup = () => {
    const isReady = settings.projectType === 'github'
      ? !!settings.postsPath && !!settings.imagesPath
      : !!settings.postsPath && !!settings.imagesPath && !!settings.domainUrl;

    if (isReady) {
      localStorage.setItem(`projectType_${repo.full_name}`, settings.projectType);
      localStorage.setItem(`postsPath_${repo.full_name}`, settings.postsPath);
      localStorage.setItem(`imagesPath_${repo.full_name}`, settings.imagesPath);
      if (settings.projectType === 'astro') {
        localStorage.setItem(`domainUrl_${repo.full_name}`, settings.domainUrl);
      }
      setIsSetupComplete(true);
    }
  }
  
  const handlePostUpdate = async (filePath: string, file: File) => {
    const commitMessage = settings.updatePostCommit.replace('{filename}', file.name);
    await githubService.uploadFile(token, repo.owner.login, repo.name, filePath, file, commitMessage);
  };
  
  const renderSetupWizard = () => {
    const isReadyForFinish = settings.projectType === 'github'
      ? !!settings.postsPath && !!settings.imagesPath
      : !!settings.postsPath && !!settings.imagesPath && !!settings.domainUrl;

    return (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.setup.wizardTitle')}</h2>
                <p className="text-gray-600 mt-1">{t('dashboard.setup.wizardDesc')}</p>
            </div>
            <div className="flex flex-col md:flex-row">
                {/* Left Pane: File Explorer */}
                <div className="w-full md:w-2/5 lg:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50">
                    <div className="p-4">
                        <h3 className="font-semibold text-gray-800">{t('dashboard.setup.explorerTitle')}</h3>
                        <p className="text-sm text-gray-500">{t('dashboard.setup.explorerHint')}</p>
                    </div>
                    <div className="h-96 overflow-y-auto p-2">
                        <RepoFileTree 
                            token={token} 
                            repo={repo} 
                            onSelectPath={(path) => handleSettingsChange('postsPath', path)}
                            selectedPath={settings.postsPath}
                            suggestedPaths={suggestedPostPaths}
                        />
                    </div>
                </div>
                {/* Right Pane: Configuration */}
                <div className="w-full md:w-3/5 lg:w-2/3 p-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-800">{t('dashboard.setup.configTitle')}</h3>
                        <p className="text-sm text-gray-500 mb-4">{t('dashboard.setup.projectTypeDesc')}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <button
                                onClick={() => handleSettingsChange('projectType', 'astro')}
                                className={`text-left p-4 border rounded-lg transition-all duration-200 ${settings.projectType === 'astro' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : 'bg-white hover:bg-gray-50 hover:border-gray-300'}`}
                            >
                                <AstroIcon className="w-6 h-6 mb-2 text-gray-700"/>
                                <p className="font-semibold text-blue-800">{t('dashboard.setup.projectTypeAstroName')}</p>
                                <p className="text-xs text-gray-600 mt-1">{t('dashboard.setup.projectTypeAstroDesc')}</p>
                            </button>
                             <button
                                onClick={() => handleSettingsChange('projectType', 'github')}
                                className={`text-left p-4 border rounded-lg transition-all duration-200 ${settings.projectType === 'github' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : 'bg-white hover:bg-gray-50 hover:border-gray-300'}`}
                            >
                                <GithubIcon className="w-6 h-6 mb-2 text-gray-700"/>
                                <p className="font-semibold text-blue-800">{t('dashboard.setup.projectTypeGithubName')}</p>
                                <p className="text-xs text-gray-600 mt-1">{t('dashboard.setup.projectTypeGithubDesc')}</p>
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.settings.directories.postsLabel')}</label>
                        {suggestedPostPaths.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">{t('dashboard.setup.suggestionsDesc')}</p>
                                {suggestedPostPaths.map(path => (
                                    <button
                                        key={path}
                                        onClick={() => handleSettingsChange('postsPath', path)}
                                        className={`w-full text-left p-3 border rounded-lg flex items-center justify-between transition-all duration-200 ${settings.postsPath === path ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : 'bg-white hover:bg-gray-50 hover:border-gray-300'}`}
                                    >
                                        <div className="flex items-center min-w-0">
                                            <FolderIcon className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                                            <code className="font-semibold text-blue-800 truncate">{path}</code>
                                        </div>
                                        {settings.postsPath === path && <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 border rounded-md">
                                <p className="text-sm text-gray-600">{t('dashboard.setup.noSuggestions')}</p>
                                <p className="text-xs text-gray-500 mt-1">{t('dashboard.setup.selectFromTree')}</p>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.settings.directories.imagesLabel')}</label>
                        {suggestedImagePaths.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">{t('dashboard.setup.imagesSuggestionsDesc')}</p>
                                {suggestedImagePaths.map(path => (
                                    <button
                                        key={path}
                                        onClick={() => handleSettingsChange('imagesPath', path)}
                                        className={`w-full text-left p-3 border rounded-lg flex items-center justify-between transition-all duration-200 ${settings.imagesPath === path ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200' : 'bg-white hover:bg-gray-50 hover:border-gray-300'}`}
                                    >
                                        <div className="flex items-center min-w-0">
                                            <ImageIcon className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
                                            <code className="font-semibold text-purple-800 truncate">{path}</code>
                                        </div>
                                        {settings.imagesPath === path && <CheckCircleIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 border rounded-md">
                                <p className="text-sm text-gray-600">{t('dashboard.setup.noImageSuggestions')}</p>
                                <p className="text-xs text-gray-500 mt-1">{t('dashboard.setup.selectFromTree')}</p>
                            </div>
                        )}
                    </div>

                    {settings.projectType === 'astro' && (
                        <div>
                            <label htmlFor="setup-domain-url" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.domain.label')}</label>
                            <input 
                                type="url"
                                id="setup-domain-url"
                                value={settings.domainUrl} 
                                onChange={(e) => handleSettingsChange('domainUrl', e.target.value)} 
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="https://my-astro-site.com"
                            />
                             <p className="text-xs text-gray-500 mt-1">{t('dashboard.setup.domainHelp')}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center">
                 <button
                    onClick={handleFinishSetup}
                    disabled={!isReadyForFinish}
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('dashboard.setup.finishButton')}
                </button>
            </div>
        </div>
    );
  }
  
  if (!isSetupComplete) {
    return (
        <div className="max-w-5xl mx-auto">
            {isScanning ? (
                <div className="mt-6 flex flex-col items-center">
                    <SpinnerIcon className="animate-spin h-8 w-8 text-blue-600" />
                    <p className="mt-4 text-gray-600">{t('dashboard.setup.scanning')}</p>
                </div>
            ) : (
                renderSetupWizard()
            )}
        </div>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'manage':
        return (
            <PostList 
              token={token} 
              repo={repo} 
              path={settings.postsPath} 
              imagesPath={settings.imagesPath}
              domainUrl={settings.domainUrl}
              projectType={settings.projectType}
              onPostUpdate={handlePostUpdate}
              postFileTypes={settings.postFileTypes}
              imageFileTypes={settings.imageFileTypes}
              newImageCommitTemplate={settings.newImageCommit}
              updatePostCommitTemplate={settings.updatePostCommit}
              imageCompressionEnabled={settings.imageCompressionEnabled}
              maxImageSize={settings.maxImageSize}
              imageResizeMaxWidth={settings.imageResizeMaxWidth}
            />
        );
      case 'create':
        return <NewPostCreator 
                  token={token}
                  repo={repo}
                  postsPath={settings.postsPath}
                  imagesPath={settings.imagesPath}
                  newPostCommitTemplate={settings.newPostCommit}
                  newImageCommitTemplate={settings.newImageCommit}
                  imageFileTypes={settings.imageFileTypes}
                  publishDateSource={settings.publishDateSource}
                  imageCompressionEnabled={settings.imageCompressionEnabled}
                  maxImageSize={settings.maxImageSize}
                  imageResizeMaxWidth={settings.imageResizeMaxWidth}
               />;
      case 'manage-images':
        return <ImageList token={token} repo={repo} path={settings.imagesPath} imageFileTypes={settings.imageFileTypes} domainUrl={settings.domainUrl} projectType={settings.projectType} />;
      case 'backup':
        return <BackupManager token={token} repo={repo} postsPath={settings.postsPath} imagesPath={settings.imagesPath} />;
      case 'template':
        return <TemplateGenerator repo={repo} />;
      case 'settings':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="space-y-8 lg:col-span-2">
               <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                    <h3 className="flex items-center text-xl font-semibold mb-6 text-gray-900">
                        <SettingsIcon className="w-6 h-6 mr-3 text-gray-500" />
                        {t('dashboard.settings.projectType.title')}
                    </h3>
                    <select
                        id="projectType"
                        value={settings.projectType}
                        onChange={(e) => handleSettingsChange('projectType', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="astro">{t('dashboard.setup.projectTypeAstroName')}</option>
                        <option value="github">{t('dashboard.setup.projectTypeGithubName')}</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">{t('dashboard.settings.projectType.help')}</p>
               </div>

               {settings.projectType !== 'github' && (
                  <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                      <h3 className="flex items-center text-xl font-semibold mb-6 text-gray-900">
                        <LinkIcon className="w-6 h-6 mr-3 text-gray-500" />
                        {t('dashboard.settings.domain.title')}
                      </h3>
                      <div>
                        <label htmlFor="domain-url" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.domain.label')}</label>
                        <input type="url" id="domain-url" value={settings.domainUrl} onChange={(e) => handleSettingsChange('domainUrl', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://my-astro-site.com"/>
                        <p className="text-xs text-gray-500 mt-1">{t('dashboard.settings.domain.help')}</p>
                        <p className="mt-2 text-xs text-yellow-800 bg-yellow-50 p-2 rounded-md border border-yellow-200">{t('dashboard.settings.domain.warning')}</p>
                      </div>
                  </div>
               )}

              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                <h3 className="flex items-center text-xl font-semibold mb-6 text-gray-900">
                  <FolderIcon className="w-6 h-6 mr-3 text-gray-500" />
                  {t('dashboard.settings.directories.title')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.directories.postsLabel')}</label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-300 rounded-md">
                        <code className="text-sm text-gray-700 truncate">{settings.postsPath || t('dashboard.settings.directories.notSelected')}</code>
                        <button onClick={() => setIsPostsPickerOpen(true)} className="ml-2 flex-shrink-0 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded">
                            {t('dashboard.settings.directories.changeButton')}
                        </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.directories.imagesLabel')}</label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-300 rounded-md">
                        <code className="text-sm text-gray-700 truncate">{settings.imagesPath || '/ (root)'}</code>
                        <button onClick={() => setIsImagesPickerOpen(true)} className="ml-2 flex-shrink-0 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded">
                            {t('dashboard.settings.directories.changeButton')}
                        </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                <h3 className="flex items-center text-xl font-semibold mb-6 text-gray-900">
                  <DocumentIcon className="w-6 h-6 mr-3 text-gray-500" />
                  {t('dashboard.settings.creation.title')}
                </h3>
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.settings.creation.publishDateLabel')}</legend>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="date-from-file"
                        name="publish-date-source"
                        type="radio"
                        value="file"
                        checked={settings.publishDateSource === 'file'}
                        onChange={(e) => handleSettingsChange('publishDateSource', e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="date-from-file" className="ml-3 block text-sm text-gray-700">
                        {t('dashboard.settings.creation.dateFromFile')}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="date-from-system"
                        name="publish-date-source"
                        type="radio"
                        value="system"
                        checked={settings.publishDateSource === 'system'}
                        onChange={(e) => handleSettingsChange('publishDateSource', e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="date-from-system" className="ml-3 block text-sm text-gray-700">
                        {t('dashboard.settings.creation.dateFromSystem')}
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t('dashboard.settings.creation.publishDateHelp')}</p>
                </fieldset>
              </div>
            </div>
            <div className="space-y-8 lg:col-span-3">
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                <h3 className="flex items-center text-xl font-semibold mb-6 text-gray-900">
                  <ImageIcon className="w-6 h-6 mr-3 text-gray-500" />
                  {t('dashboard.settings.compression.title')}
                </h3>
                <div className="space-y-6">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="compression-enabled"
                                name="compression-enabled"
                                type="checkbox"
                                checked={settings.imageCompressionEnabled}
                                onChange={(e) => handleSettingsChange('imageCompressionEnabled', e.target.checked)}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="compression-enabled" className="font-medium text-gray-700">{t('dashboard.settings.compression.enableLabel')}</label>
                            <p className="text-gray-500 text-xs mt-1">{t('dashboard.settings.compression.enableHelp')}</p>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="max-image-size" className="block text-sm font-medium text-gray-700">{t('dashboard.settings.compression.maxSizeLabel')}</label>
                          <input
                              type="number"
                              id="max-image-size"
                              value={settings.maxImageSize}
                              onChange={(e) => handleSettingsChange('maxImageSize', Number(e.target.value))}
                              min="1"
                              disabled={!settings.imageCompressionEnabled}
                              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <p className="text-gray-500 text-xs mt-1">{t('dashboard.settings.compression.maxSizeHelp')}</p>
                      </div>
                      <div>
                          <label htmlFor="image-resize" className="block text-sm font-medium text-gray-700">{t('dashboard.settings.compression.resizeLabel')}</label>
                          <select 
                            id="image-resize"
                            value={settings.imageResizeMaxWidth}
                            onChange={(e) => handleSettingsChange('imageResizeMaxWidth', Number(e.target.value))}
                            disabled={!settings.imageCompressionEnabled}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            <option value="0">{t('dashboard.settings.compression.originalSize')}</option>
                            <option value="1920">1920px (Full HD)</option>
                            <option value="1280">1280px (HD)</option>
                            <option value="1024">1024px</option>
                            <option value="800">800px</option>
                          </select>
                           <p className="text-gray-500 text-xs mt-1">{t('dashboard.settings.compression.resizeHelp')}</p>
                      </div>
                    </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                <h3 className="flex items-center text-xl font-semibold mb-6 text-gray-900">
                  <GithubIcon className="w-6 h-6 mr-3 text-gray-500" />
                  {t('dashboard.settings.commits.title')}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="new-post-commit" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.commits.newPostLabel')}</label>
                    <input type="text" id="new-post-commit" value={settings.newPostCommit} onChange={(e) => handleSettingsChange('newPostCommit', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="update-post-commit" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.commits.updatePostLabel')}</label>
                    <input type="text" id="update-post-commit" value={settings.updatePostCommit} onChange={(e) => handleSettingsChange('updatePostCommit', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="new-image-commit" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.commits.newImageLabel')}</label>
                    <input type="text" id="new-image-commit" value={settings.newImageCommit} onChange={(e) => handleSettingsChange('newImageCommit', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="update-image-commit" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.commits.updateImageLabel')}</label>
                    <input type="text" id="update-image-commit" value={settings.updateImageCommit} onChange={(e) => handleSettingsChange('updateImageCommit', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-gray-500 p-2 bg-gray-100 rounded-md border border-gray-200">
                    <InfoIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    {t('dashboard.settings.commits.help')}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                <h3 className="flex items-center text-xl font-semibold mb-6 text-gray-900">
                  <DocumentIcon className="w-6 h-6 mr-3 text-gray-500" />
                  {t('dashboard.settings.fileTypes.title')}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="post-types" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.fileTypes.postLabel')}</label>
                    <input type="text" id="post-types" value={settings.postFileTypes} onChange={(e) => handleSettingsChange('postFileTypes', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder=".md,.mdx" />
                    <p className="text-xs text-gray-500 mt-1">{t('dashboard.settings.fileTypes.postHelp')}</p>
                  </div>
                  <div>
                    <label htmlFor="image-types" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.fileTypes.imageLabel')}</label>
                    <input type="text" id="image-types" value={settings.imageFileTypes} onChange={(e) => handleSettingsChange('imageFileTypes', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="image/*,.webp" />
                    <p className="text-xs text-gray-500 mt-1">{t('dashboard.settings.fileTypes.imageHelp')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-red-300 p-6 rounded-lg shadow-sm">
                  <h3 className="flex items-center text-xl font-semibold mb-4 text-red-800">
                      <ExclamationTriangleIcon className="w-6 h-6 mr-3" />
                      {t('dashboard.settings.dangerZone.title')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{t('dashboard.settings.dangerZone.descriptionLogout')}</p>
                  <button
                      onClick={onResetAndLogout}
                      className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                  >
                      {t('dashboard.settings.dangerZone.resetButtonLogout')}
                  </button>
              </div>

              <div className="mt-8 flex items-center justify-end p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg -m-6 lg:col-span-5">
                  {saveSuccess && (
                      <div className="flex items-center text-sm text-green-600 mr-4">
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          {t('dashboard.settings.saveSuccess')}
                      </div>
                  )}
                  <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
                  >
                      {isSaving ? (
                          <SpinnerIcon className="animate-spin h-5 w-5" />
                      ) : (
                          t('dashboard.settings.saveButton')
                      )}
                  </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const lastUpdated = new Date(repo.pushed_at).toLocaleString(language, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  
  const navLinks = [
    { id: 'manage', label: t('dashboard.nav.manage'), icon: ListIcon, isAction: false },
    { id: 'create', label: t('dashboard.nav.create'), icon: PlusCircleIcon, isAction: false },
    { id: 'manage-images', label: t('dashboard.nav.manageImages'), icon: ImageIcon, isAction: false },
    { id: 'template', label: t('dashboard.nav.template'), icon: ClipboardDocumentListIcon, isAction: false },
    { id: 'backup', label: t('dashboard.nav.backup'), icon: ArchiveBoxIcon, isAction: false },
    { id: 'settings', label: t('dashboard.nav.settings'), icon: SettingsIcon, isAction: false },
    { id: 'guide', label: t('dashboard.nav.guide'), icon: QuestionMarkCircleIcon, isAction: true },
  ];

  const handleNavClick = (tabId: string, isAction: boolean | undefined) => {
    if (isAction) {
        if (tabId === 'guide') {
            setIsGuideModalOpen(true);
        }
    } else {
        setActiveTab(tabId as any);
    }
    setIsMenuOpen(false);
  };

  const renderNavButton = (link: typeof navLinks[0]) => (
    <button
        key={link.id}
        onClick={() => handleNavClick(link.id, link.isAction)}
        className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium transition-colors rounded-lg ${
            activeTab === link.id && !link.isAction
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        <link.icon className="mr-3 h-5 w-5 flex-shrink-0" />
        {link.label}
    </button>
  );

  return (
    <div>
       {isPostsPickerOpen && (
        <DirectoryPicker
          token={token}
          repo={repo}
          onClose={() => setIsPostsPickerOpen(false)}
          onSelect={(path) => {
            handleSettingsChange('postsPath', path);
            setIsPostsPickerOpen(false);
          }}
          initialPath={settings.postsPath}
        />
      )}
      {isImagesPickerOpen && (
        <DirectoryPicker
          token={token}
          repo={repo}
          onClose={() => setIsImagesPickerOpen(false)}
          onSelect={(path) => {
            handleSettingsChange('imagesPath', path);
            setIsImagesPickerOpen(false);
          }}
          initialPath={settings.imagesPath}
        />
      )}
      {isGuideModalOpen && <GuideModal onClose={() => setIsGuideModalOpen(false)} />}

      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard.header.title')} <span className="text-blue-600">{repo.full_name}</span></h2>
          <p className="text-gray-600 mt-1">{t('dashboard.header.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-t border-gray-200">
          <StatCard title={t('dashboard.stats.posts')} value={repoStats.postCount ?? '...'} icon={<DocumentIcon className="w-6 h-6 text-blue-500"/>} />
          <StatCard title={t('dashboard.stats.images')} value={repoStats.imageCount ?? '...'} icon={<ImageIcon className="w-6 h-6 text-purple-500"/>} />
          <StatCard title={t('dashboard.stats.lastUpdated')} value={lastUpdated} icon={<InfoIcon className="w-6 h-6 text-yellow-500"/>} />
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center">
              <div className="bg-gray-100 rounded-full p-3 mr-4">
                  <div className="w-6 h-6 flex items-center justify-center">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                  </div>
              </div>
              <div>
                  <p className="text-sm text-gray-500 font-medium">{t('dashboard.stats.status')}</p>
                  <p className="text-xl font-bold text-gray-900">{t('dashboard.stats.connected')}</p>
              </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0 md:sticky md:top-24 self-start">
            {/* Mobile Menu */}
            <div ref={menuRef} className="md:hidden relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-full flex justify-between items-center px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 shadow-sm rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <span>{navLinks.find(l => l.id === activeTab)?.label || t('dashboard.nav.menuTitle')}</span>
                    <MenuIcon className="h-5 w-5 text-gray-500" />
                </button>
                {isMenuOpen && (
                    <nav className="absolute z-10 mt-2 w-full bg-white border border-gray-200 shadow-lg rounded-lg p-2 space-y-1">
                        {navLinks.map(renderNavButton)}
                    </nav>
                )}
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex flex-col p-2 space-y-2 bg-white border border-gray-200 shadow-sm rounded-lg">
                {navLinks.map(renderNavButton)}
            </nav>
        </aside>

        <main className="flex-grow min-w-0">
            {renderContent()}
        </main>
      </div>

      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <p>Astro Content Manager v1.3.2</p>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <p>
                  {t('dashboard.footer.sponsoredBy')}{' '}
                  <a href="https://www.redd.com.vn" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline transition-colors">
                      REDD
                  </a>
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;