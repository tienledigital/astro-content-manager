import React, { useState, useEffect } from 'react';
import { GithubRepo } from '../types';
import { parseMarkdown, inferFrontmatterType } from '../utils/parsing';
import { UploadIcon } from './icons/UploadIcon';
import { InfoIcon } from './icons/InfoIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { useI18n } from '../i18n/I18nContext';

interface TemplateGeneratorProps {
    repo: GithubRepo;
}

const defaultTemplate: Record<string, string> = {
    publishDate: 'date',
    title: 'string',
    author: 'string',
    excerpt: 'string',
    image: 'string',
    category: 'string',
    tags: 'array',
    metadata: 'object',
};

const TemplateGenerator: React.FC<TemplateGeneratorProps> = ({ repo }) => {
    const [currentTemplate, setCurrentTemplate] = useState<Record<string, string> | null>(null);
    const [parsedTemplate, setParsedTemplate] = useState<Record<string, string> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { t } = useI18n();

    const templateKey = `postTemplate_${repo.full_name}`;

    useEffect(() => {
        const savedTemplate = localStorage.getItem(templateKey);
        if (savedTemplate) {
            try {
                setCurrentTemplate(JSON.parse(savedTemplate));
            } catch (e) {
                console.error("Failed to parse template from localStorage", e);
            }
        } else {
            setCurrentTemplate(null);
        }
    }, [templateKey]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setParsedTemplate(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const { frontmatter } = parseMarkdown(content);

                if (Object.keys(frontmatter).length === 0) {
                    throw new Error(t('templateGenerator.error.noFrontmatter'));
                }

                const newTemplate: Record<string, string> = {};
                for (const [key, value] of Object.entries(frontmatter)) {
                    newTemplate[key] = inferFrontmatterType(value);
                }
                setParsedTemplate(newTemplate);
            } catch (err) {
                setError(err instanceof Error ? err.message : t('templateGenerator.error.parse'));
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setError(t('templateGenerator.error.read'));
            setIsLoading(false);
        };
        reader.readAsText(file);
    };

    const saveTemplate = (templateToSave: Record<string, string>) => {
        localStorage.setItem(templateKey, JSON.stringify(templateToSave));
        setCurrentTemplate(templateToSave);
        const isDefault = JSON.stringify(templateToSave) === JSON.stringify(defaultTemplate);
        setSuccess(isDefault ? t('templateGenerator.success.default') : t('templateGenerator.success.saved'));
        setParsedTemplate(null);
        setError(null);
    };

    const handleDownloadSample = (template: Record<string, string>) => {
        let fmString = '---\n';
        for (const [key, type] of Object.entries(template)) {
            switch(type) {
                case 'date': fmString += `${key}: ${new Date().toISOString().split('T')[0]}\n`; break;
                case 'array': fmString += `${key}:\n  - item1\n  - item2\n`; break;
                case 'object': fmString += `${key}:\n  subKey: "sub value"\n`; break;
                case 'string':
                default: fmString += `${key}: "Your ${key} here"\n`; break;
            }
        }
        fmString += '---\n\nYour content here...';
        
        const blob = new Blob([fmString], { type: 'text/markdown;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'template-sample.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const renderTemplateTable = (template: Record<string, string>, title: string) => (
        <div>
            <h3 className="text-md font-semibold text-gray-800 mb-2">{title}</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('templateGenerator.table.field')}</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('templateGenerator.table.type')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(template).map(([key, type]) => (
                            <tr key={key}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{type}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderRightColumn = () => {
        if (parsedTemplate) {
            return (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    {renderTemplateTable(parsedTemplate, t('templateGenerator.previewTitle'))}
                    <div className="mt-4 flex justify-end">
                        <button onClick={() => saveTemplate(parsedTemplate)} className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200">
                            {t('templateGenerator.saveButton')}
                        </button>
                    </div>
                </div>
            );
        }

        const activeTemplate = currentTemplate || defaultTemplate;
        const isCustomTemplateActive = !!currentTemplate;
        
        return (
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                {renderTemplateTable(activeTemplate, isCustomTemplateActive ? t('templateGenerator.activeTitle') : t('templateGenerator.defaultTitle'))}
                <div className="mt-4 flex justify-between items-center">
                    <button onClick={() => handleDownloadSample(activeTemplate)} className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-200">
                       <DownloadIcon className="w-4 h-4 mr-2" />
                       {t('templateGenerator.downloadButton')}
                    </button>
                    <button 
                        onClick={() => saveTemplate(defaultTemplate)}
                        disabled={!isCustomTemplateActive}
                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <CheckCircleIcon className="w-5 h-5 mr-2" />
                       {t('templateGenerator.useDefaultButton')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* --- LEFT COLUMN --- */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{t('templateGenerator.title')}</h2>
                    <p className="text-gray-600 text-sm mb-4">{t('templateGenerator.description')}</p>
                    
                    <div className="mt-4 p-3 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-md flex items-start">
                        <InfoIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                        <span>{t('templateGenerator.info')}</span>
                    </div>
                    
                    <div className="mt-6">
                        <label htmlFor="template-upload" className="relative block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <span className="mt-2 block text-sm font-medium text-blue-600">
                                {isLoading ? t('templateGenerator.processing') : t('templateGenerator.uploadTitle')}
                            </span>
                            <span className="mt-1 block text-xs text-gray-500">{t('templateGenerator.uploadDesc')}</span>
                            <input id="template-upload" type="file" className="sr-only" accept=".md,.mdx" onChange={handleFileChange} disabled={isLoading} />
                        </label>
                    </div>
                </div>

                 {error && <p className="text-red-500 text-sm">{error}</p>}
                 {success && 
                    <div className="flex items-center p-3 text-sm text-green-800 bg-green-50 border border-green-200 rounded-md">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        {success}
                    </div>
                }
            </div>

             {/* --- RIGHT COLUMN --- */}
            <div className="space-y-8">
                {renderRightColumn()}
            </div>
        </div>
    );
};

export default TemplateGenerator;