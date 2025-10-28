
import React from 'react';
import { useI18n } from '../i18n/I18nContext';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useI18n();

    const buttonClasses = (lang: 'en' | 'vi') => 
        `px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
            language === lang 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-600 hover:bg-gray-200'
        }`;

    return (
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setLanguage('en')} className={buttonClasses('en')}>
                EN
            </button>
            <button onClick={() => setLanguage('vi')} className={buttonClasses('vi')}>
                VI
            </button>
        </div>
    );
};
