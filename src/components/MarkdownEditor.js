'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function MarkdownEditor({ content, onChange, placeholder = "Введите содержимое..." }) {
  const [isPreview, setIsPreview] = useState(false);
  const [localContent, setLocalContent] = useState(content || '');

  useEffect(() => {
    setLocalContent(content || '');
  }, [content]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
      <div className="flex border-b" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-tertiary)' }}>
        <button
          onClick={() => setIsPreview(false)}
          className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
            !isPreview 
              ? 'bg-white border-b-2 text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          style={!isPreview ? { borderBottomColor: 'var(--accent-primary)' } : {}}
        >
          Редактор
        </button>
        <button
          onClick={() => setIsPreview(true)}
          className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
            isPreview 
              ? 'bg-white border-b-2 text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          style={isPreview ? { borderBottomColor: 'var(--accent-primary)' } : {}}
        >
          Предварительный просмотр
        </button>
      </div>

      {isPreview ? (
        <div className="p-8 min-h-96 prose prose-slate max-w-none" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {localContent ? (
            <ReactMarkdown className="text-slate-800">{localContent}</ReactMarkdown>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <span className="text-2xl">📄</span>
                </div>
                <p className="section-subtitle">Нет содержимого для предварительного просмотра</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={localContent}
          onChange={handleContentChange}
          placeholder={placeholder}
          className="w-full p-8 min-h-96 resize-none focus:outline-none font-mono text-sm"
          style={{ 
            minHeight: '24rem',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)'
          }}
        />
      )}
    </div>
  );
}