

import React, { useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { useI18n } from '../i18n/I18nContext';

interface GuideModalProps {
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
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

  // Styled H3 for sections
  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">{children}</h3>
  );

  // Styled Paragraph
  const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>
  );
  
  // Styled List
  const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ul className="list-disc list-inside space-y-2 pl-4 text-gray-700 mb-3">{children}</ul>
  );
  
  // Styled Code
  const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <code className="bg-gray-200 text-gray-800 font-mono text-sm px-1 py-0.5 rounded">{children}</code>
  );

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
          <h2 className="text-lg font-semibold text-gray-800">{t('guide.title')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200" aria-label="Close modal">
            <CloseIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow bg-gray-50">
            <div className="prose prose-sm sm:prose-base max-w-none">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4">{t('guide.welcome.title')}</h2>
                <P>{t('guide.welcome.p1')}</P>

                <SectionTitle>{t('guide.overview.title')}</SectionTitle>
                <P><strong>{t('guide.overview.purposeLabel')}</strong> {t('guide.overview.purposeText')}</P>
                <P><strong>{t('guide.overview.techLabel')}</strong></P>
                <UL>
                    <li><strong>{t('guide.overview.tech.framework')}</strong></li>
                    <li><strong>{t('guide.overview.tech.styling')}</strong></li>
                    <li><strong>{t('guide.overview.tech.api')}</strong> <Code>fetch</Code> {t('guide.overview.tech.apiText')}</li>
                    <li><strong>{t('guide.overview.tech.libs')}</strong>
                        <ul className="list-['-_'] list-inside pl-4 mt-1 space-y-1">
                            <li><Code>Marked</Code> & <Code>DOMPurify</Code>: {t('guide.overview.tech.libsMarked')}</li>
                            <li><Code>JSZip</Code>: {t('guide.overview.tech.libsJsZip')} <Code>.zip</Code> {t('guide.overview.tech.libsJsZip2')}</li>
                        </ul>
                    </li>
                    <li><strong>{t('guide.overview.tech.special')}</strong> {t('guide.overview.tech.specialText')} <Code>importmap</Code> {t('guide.overview.tech.specialText2')} <Code>index.html</Code> {t('guide.overview.tech.specialText3')} <Code>index.html</Code> {t('guide.overview.tech.specialText4')}</li>
                </UL>

                <SectionTitle>{t('guide.workflow.title')}</SectionTitle>
                <P>{t('guide.workflow.intro')}</P>
                <ol className="list-decimal list-inside space-y-3 pl-4 text-gray-700">
                    <li>
                        <strong>{t('guide.workflow.step1.title')}</strong>
                        <UL>
                            <li>{t('guide.workflow.step1.li1')}</li>
                            <li>{t('guide.workflow.step1.li2.t1')} <strong>{t('guide.workflow.step1.li2.strong1')}</strong> {t('guide.workflow.step1.li2.t2')} <strong>{t('guide.workflow.step1.li2.strong2')}</strong> {t('guide.workflow.step1.li2.t3')} <Code>{t('guide.workflow.step1.li2.code1')}</Code> {t('guide.workflow.step1.li2.t4')} <Code>{t('guide.workflow.step1.li2.code2')}</Code> {t('guide.workflow.step1.li2.t5')}</li>
                        </UL>
                    </li>
                     <li>
                        <strong>{t('guide.workflow.step2.title')}</strong>
                        <UL>
                            <li>{t('guide.workflow.step2.li1')}</li>
                            <li>{t('guide.workflow.step2.li2.t1')} <Code>Web Crypto API</Code> {t('guide.workflow.step2.li2.t2')} <Code>sessionStorage</Code> {t('guide.workflow.step2.li2.t3')}</li>
                            <li>{t('guide.workflow.step2.li3')}</li>
                        </UL>
                    </li>
                    <li>
                        <strong>{t('guide.workflow.step3.title')}</strong>
                         <UL>
                            <li>{t('guide.workflow.step3.li1.t1')} <Code>src/content/blog</Code>).</li>
                            <li>{t('guide.workflow.step3.li2.t1')} <Code>localStorage</Code> {t('guide.workflow.step3.li2.t2')}</li>
                        </UL>
                    </li>
                     <li>
                        <strong>{t('guide.workflow.step4.title')}</strong>
                         <UL>
                            <li>{t('guide.workflow.step4.li1')}</li>
                            <li>{t('guide.workflow.step4.li2')}</li>
                        </UL>
                    </li>
                    <li>
                        <strong>{t('guide.workflow.step5.title')}</strong>
                         <UL>
                            <li>{t('guide.workflow.step5.li1.t1')} <Code>sessionStorage</Code> {t('guide.workflow.step5.li1.t2')}</li>
                        </UL>
                    </li>
                </ol>

                 <SectionTitle>{t('guide.structure.title')}</SectionTitle>
                    <UL>
                        <li><strong>index.html</strong>: {t('guide.structure.index')}</li>
                        <li><strong>App.tsx</strong>: {t('guide.structure.app')}</li>
                        <li><strong>services/githubService.ts</strong>: {t('guide.structure.service')}</li>
                        <li><strong>utils/</strong>: {t('guide.structure.utils')}</li>
                        <li><strong>components/</strong>: {t('guide.structure.components')}
                             <ul className="list-['-_'] list-inside pl-4 mt-1 space-y-1">
                                <li><strong>Dashboard.tsx</strong>: {t('guide.structure.componentsDashboard')}</li>
                                <li><strong>PostList.tsx</strong>: {t('guide.structure.componentsPostList')}</li>
                                <li><strong>NewPostCreator.tsx</strong>: {t('guide.structure.componentsNewPost')}</li>
                                <li><strong>TemplateGenerator.tsx</strong>: {t('guide.structure.componentsTemplate')}</li>
                                <li><strong>BackupManager.tsx</strong>: {t('guide.structure.componentsBackup')}</li>
                                <li><strong>DirectoryPicker.tsx</strong>: {t('guide.structure.componentsPicker')}</li>
                            </ul>
                        </li>
                    </UL>
                
                <SectionTitle>{t('guide.i18n.title')}</SectionTitle>
                <P>
                    {t('guide.i18n.p1')} <Code>{t('guide.i18n.p1_code1')}</Code> {t('guide.i18n.p1_cont')} <Code>{t('guide.i18n.p1_code2')}</Code> {t('guide.i18n.p1_cont2')} <Code>{t('guide.i18n.p1_code3')}</Code> {t('guide.i18n.p1_cont3')} <Code>{t('guide.i18n.p1_code4')}</Code> {t('guide.i18n.p1_cont4')} <Code>{t('guide.i18n.p1_code5')}</Code> {t('guide.i18n.p1_cont5')}
                </P>

                <SectionTitle>{t('guide.updating.title')}</SectionTitle>
                <P>{t('guide.updating.p1')}</P>
                <P>{t('guide.updating.p2')}</P>
                <pre className="bg-gray-800 text-white p-3 rounded-md text-sm my-4 overflow-x-auto">
                    <code>{t('guide.updating.code')}</code>
                </pre>
                <P>{t('guide.updating.p3')}</P>
            </div>
        </main>
      </div>
    </div>
  );
};
export default GuideModal;