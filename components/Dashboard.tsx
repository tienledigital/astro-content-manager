
import React, { useState, useEffect, useRef } from 'react';
import { GithubRepo } from '../types';
import PostList from './PostList';
import NewPostCreator from './NewPostCreator';
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

interface DashboardProps {
  token: string;
  repo: GithubRepo;
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

const Dashboard: React.FC<DashboardProps> = ({ token, repo }) => {
  const [postsPath, setPostsPath] = useState('');
  const [imagesPath, setImagesPath] = useState('');
  const [activeTab, setActiveTab] = useState<'manage' | 'create' | 'backup' | 'template' | 'settings'>('manage');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isPostsPathValid, setIsPostsPathValid] = useState(false);
  const [isPostsPickerOpen, setIsPostsPickerOpen] = useState(false);
  const [isImagesPickerOpen, setIsImagesPickerOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  
  const [repoStats, setRepoStats] = useState<{postCount: number | null, imageCount: number | null}>({ postCount: null, imageCount: null });

  const [postFileTypes, setPostFileTypes] = useState(() => localStorage.getItem('postFileTypes') || '.md,.mdx');
  const [imageFileTypes, setImageFileTypes] = useState(() => localStorage.getItem('imageFileTypes') || 'image/*');
  const [publishDateSource, setPublishDateSource] = useState<'file' | 'system'>(() => (localStorage.getItem(`publishDateSource_${repo.full_name}`) as 'file' | 'system') || 'file');

  // Commit Message Templates
  const [newPostCommit, setNewPostCommit] = useState(() => localStorage.getItem('newPostCommit') || 'feat(content): add post "{filename}"');
  const [updatePostCommit, setUpdatePostCommit] = useState(() => localStorage.getItem('updatePostCommit') || 'fix(content): update post "{filename}"');
  const [newImageCommit, setNewImageCommit] = useState(() => localStorage.getItem('newImageCommit') || 'feat(assets): add image "{filename}"');
  const [updateImageCommit, setUpdateImageCommit] = useState(() => localStorage.getItem('updateImageCommit') || 'refactor(assets): update image for "{filename}"');

  const [suggestedPaths, setSuggestedPaths] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [isDefaultSuggestion, setIsDefaultSuggestion] = useState(false);
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

  useEffect(() => {
    const savedPostsPath = localStorage.getItem(`postsPath_${repo.full_name}`);
    const savedImagesPath = localStorage.getItem(`imagesPath_${repo.full_name}`);
    
    if (savedPostsPath) {
        setPostsPath(savedPostsPath);
        setIsPostsPathValid(true);
        setIsScanning(false);
    } else {
        setIsScanning(true);
        githubService.scanForContentDirectories(token, repo.owner.login, repo.name)
            .then(paths => {
                setIsDefaultSuggestion(false);
                if (paths.length > 0) {
                    setSuggestedPaths(paths);
                } else {
                    githubService.getRepoContents(token, repo.owner.login, repo.name, 'src/data/post')
                        .then(() => {
                            setSuggestedPaths(['src/data/post']);
                            setIsDefaultSuggestion(true);
                        })
                        .catch(() => setSuggestedPaths([]));
                }
            })
            .catch(err => console.error("Failed to scan for content directories:", err))
            .finally(() => setIsScanning(false));
    }
    
    setImagesPath(savedImagesPath || 'public/images');
  }, [repo.full_name, repo.owner.login, repo.name, token]);

  useEffect(() => {
    if (isPostsPathValid) {
        const fetchStats = async () => {
            setRepoStats({ postCount: null, imageCount: null });
            try {
                const postContents = await githubService.getRepoContents(token, repo.owner.login, repo.name, postsPath);
                const postCount = postContents.filter(item => item.type === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.mdx'))).length;
                
                let imageCount = 0;
                try {
                    const imageContents = await githubService.getRepoContents(token, repo.owner.login, repo.name, imagesPath);
                    imageCount = imageContents.filter(item => item.type === 'file').length;
                } catch (imgError) {
                    console.warn(`Could not fetch image stats from '${imagesPath}':`, imgError);
                }

                setRepoStats({ postCount, imageCount });
            } catch (err) {
                console.error("Failed to fetch repo stats:", err);
            }
        };
        fetchStats();
    }
  }, [token, repo, postsPath, imagesPath, isPostsPathValid]);

  useEffect(() => { if(postsPath) localStorage.setItem(`postsPath_${repo.full_name}`, postsPath); }, [postsPath, repo.full_name]);
  useEffect(() => { localStorage.setItem(`imagesPath_${repo.full_name}`, imagesPath); }, [imagesPath, repo.full_name]);
  useEffect(() => { localStorage.setItem('postFileTypes', postFileTypes); }, [postFileTypes]);
  useEffect(() => { localStorage.setItem('imageFileTypes', imageFileTypes); }, [imageFileTypes]);
  useEffect(() => { localStorage.setItem('newPostCommit', newPostCommit); }, [newPostCommit]);
  useEffect(() => { localStorage.setItem('updatePostCommit', updatePostCommit); }, [updatePostCommit]);
  useEffect(() => { localStorage.setItem('newImageCommit', newImageCommit); }, [newImageCommit]);
  useEffect(() => { localStorage.setItem('updateImageCommit', updateImageCommit); }, [updateImageCommit]);
  useEffect(() => { localStorage.setItem(`publishDateSource_${repo.full_name}`, publishDateSource); }, [publishDateSource, repo.full_name]);
  
  const handlePostUpdate = async (filePath: string, file: File) => {
    const commitMessage = updatePostCommit.replace('{filename}', file.name);
    await githubService.uploadFile(token, repo.owner.login, repo.name, filePath, file, commitMessage);
  };
  
  const handleSelectSuggestedPath = (path: string) => {
    setPostsPath(path);
    setIsPostsPathValid(true);
  };
  
  if (!isPostsPathValid) {
    return (
        <>
            {isPostsPickerOpen && (
                <DirectoryPicker
                    token={token}
                    repo={repo}
                    onClose={() => setIsPostsPickerOpen(false)}
                    onSelect={(path) => {
                        setPostsPath(path);
                        setIsPostsPathValid(true);
                        setIsPostsPickerOpen(false);
                    }}
                    initialPath={postsPath}
                />
            )}
            <div className="text-center max-w-2xl mx-auto p-8 bg-white border border-gray-200 rounded-lg shadow-md">
                <GithubIcon className="mx-auto h-12 w-12 text-gray-800" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">{t('dashboard.setup.title')}</h2>
                
                {isScanning ? (
                    <div className="mt-6 flex flex-col items-center">
                        <SpinnerIcon className="animate-spin h-8 w-8 text-blue-600" />
                        <p className="mt-4 text-gray-600">{t('dashboard.setup.scanning')}</p>
                    </div>
                ) : (
                    <>
                        {suggestedPaths.length > 0 ? (
                            <div className="mt-6 text-left">
                                <h3 className="text-lg font-semibold text-gray-800 text-center">{t('dashboard.setup.suggestionsTitle')}</h3>
                                <p className="text-gray-600 mt-2 mb-4 text-center">
                                    {isDefaultSuggestion 
                                        ? t('dashboard.setup.suggestionsDefaultDesc')
                                        : t('dashboard.setup.suggestionsDesc')
                                    }
                                </p>
                                <div className="space-y-2">
                                    {suggestedPaths.map(path => (
                                        <button 
                                            key={path}
                                            onClick={() => handleSelectSuggestedPath(path)}
                                            className="w-full text-left p-3 bg-gray-50 hover:bg-blue-100 border border-gray-200 rounded-md transition-colors"
                                        >
                                            <code className="font-mono text-blue-700">{path}</code>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 text-center text-gray-500 text-sm">{t('dashboard.setup.manualOption')}</div>
                            </div>
                        ) : (
                           <p className="mt-2 text-gray-600">
                                {t('dashboard.setup.noSuggestions')}
                            </p>
                        )}
                        <div className="mt-6">
                            <button
                                onClick={() => setIsPostsPickerOpen(true)}
                                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                            >
                                <FolderIcon className="w-5 h-5 mr-2" />
                                {t('dashboard.setup.manualButton')}
                            </button>
                        </div>
                    </>
                )}

                <p className="mt-4 text-sm text-gray-500">
                    {t('dashboard.setup.saveNote')}
                </p>
            </div>
        </>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'manage':
        return (
            <PostList 
              token={token} 
              repo={repo} 
              path={postsPath} 
              imagesPath={imagesPath}
              onPostUpdate={handlePostUpdate}
              postFileTypes={postFileTypes}
              imageFileTypes={imageFileTypes}
              newImageCommitTemplate={newImageCommit}
              updatePostCommitTemplate={updatePostCommit}
            />
        );
      case 'create':
        return <NewPostCreator 
                  token={token}
                  repo={repo}
                  postsPath={postsPath}
                  imagesPath={imagesPath}
                  newPostCommitTemplate={newPostCommit}
                  newImageCommitTemplate={newImageCommit}
                  imageFileTypes={imageFileTypes}
                  publishDateSource={publishDateSource}
               />;
      case 'backup':
        return <BackupManager token={token} repo={repo} postsPath={postsPath} imagesPath={imagesPath} />;
      case 'template':
        return <TemplateGenerator repo={repo} />;
      case 'settings':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="space-y-8 lg:col-span-2">
              <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                <h3 className="flex items-center text-xl font-semibold mb-6 text-gray-900">
                  <FolderIcon className="w-6 h-6 mr-3 text-gray-500" />
                  {t('dashboard.settings.directories.title')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.directories.postsLabel')}</label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-300 rounded-md">
                        <code className="text-sm text-gray-700 truncate">{postsPath || t('dashboard.settings.directories.notSelected')}</code>
                        <button onClick={() => setIsPostsPickerOpen(true)} className="ml-2 flex-shrink-0 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded">
                            {t('dashboard.settings.directories.changeButton')}
                        </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.directories.imagesLabel')}</label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-300 rounded-md">
                        <code className="text-sm text-gray-700 truncate">{imagesPath || '/ (root)'}</code>
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
                        checked={publishDateSource === 'file'}
                        onChange={(e) => setPublishDateSource(e.target.value as 'file' | 'system')}
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
                        checked={publishDateSource === 'system'}
                        onChange={(e) => setPublishDateSource(e.target.value as 'file' | 'system')}
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
                  <GithubIcon className="w-6 h-6 mr-3 text-gray-500" />
                  {t('dashboard.settings.commits.title')}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="new-post-commit" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.commits.newPostLabel')}</label>
                    <input type="text" id="new-post-commit" value={newPostCommit} onChange={(e) => setNewPostCommit(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="update-post-commit" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.commits.updatePostLabel')}</label>
                    <input type="text" id="update-post-commit" value={updatePostCommit} onChange={(e) => setUpdatePostCommit(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="new-image-commit" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.commits.newImageLabel')}</label>
                    <input type="text" id="new-image-commit" value={newImageCommit} onChange={(e) => setNewImageCommit(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="update-image-commit" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.commits.updateImageLabel')}</label>
                    <input type="text" id="update-image-commit" value={updateImageCommit} onChange={(e) => setUpdateImageCommit(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                    <input type="text" id="post-types" value={postFileTypes} onChange={(e) => setPostFileTypes(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder=".md,.mdx" />
                    <p className="text-xs text-gray-500 mt-1">{t('dashboard.settings.fileTypes.postHelp')}</p>
                  </div>
                  <div>
                    <label htmlFor="image-types" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.settings.fileTypes.imageLabel')}</label>
                    <input type="text" id="image-types" value={imageFileTypes} onChange={(e) => setImageFileTypes(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="image/*,.webp" />
                    <p className="text-xs text-gray-500 mt-1">{t('dashboard.settings.fileTypes.imageHelp')}</p>
                  </div>
                </div>
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
            setPostsPath(path);
            setIsPostsPathValid(true);
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
            <p>Astro Content Manager v1.3.1</p>
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
