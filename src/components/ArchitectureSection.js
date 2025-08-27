'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, DocumentIcon, TrashIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import MarkdownEditor from './MarkdownEditor';

export default function ArchitectureSection() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files?directory=architecture');
      const data = await response.json();
      setFiles(data.files || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading files:', error);
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setEditingContent(file.content);
    setIsCreatingNew(false);
  };

  const handleSaveFile = async () => {
    try {
      const filename = selectedFile ? selectedFile.name : `${newFileName}.md`;
      
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directory: 'architecture',
          filename,
          content: editingContent
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadFiles();
        if (isCreatingNew) {
          setIsCreatingNew(false);
          setNewFileName('');
        }
        // Find and select the updated/created file
        const updatedFiles = await fetch('/api/files?directory=architecture').then(r => r.json());
        const file = updatedFiles.files.find(f => f.name === filename);
        if (file) {
          setSelectedFile(file);
        }
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const handleDeleteFile = async (filename) => {
    if (!confirm('Вы уверены, что хотите удалить этот файл?')) return;

    try {
      const response = await fetch(`/api/files?directory=architecture&filename=${filename}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        await loadFiles();
        if (selectedFile && selectedFile.name === filename) {
          setSelectedFile(null);
          setEditingContent('');
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const startCreatingNew = () => {
    setIsCreatingNew(true);
    setSelectedFile(null);
    setEditingContent('# Новый архитектурный документ\n\n');
    setNewFileName('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="modern-card p-8 text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="section-subtitle">Загрузка документов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="section-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <Squares2X2Icon className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
            Архитектура
          </h1>
          <p className="section-subtitle">Управление архитектурными документами проекта</p>
        </div>
        <button
          onClick={startCreatingNew}
          className="modern-button-primary flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Новый документ
        </button>
      </div>

      <div className="content-grid">
        {/* Files list */}
        <div className="modern-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <DocumentIcon className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Документы ({files.length})
            </h3>
          </div>
          
          {files.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <DocumentIcon className="h-8 w-8" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p className="section-subtitle">Нет документов</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.name} className="flex items-center gap-2">
                  <button
                    onClick={() => handleFileSelect(file)}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      selectedFile?.name === file.name
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <DocumentIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium truncate">{file.slug}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.name)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="modern-card p-6">
          {(selectedFile || isCreatingNew) ? (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex-1">
                  {isCreatingNew ? (
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="Название файла (без .md)"
                      className="modern-input w-full"
                    />
                  ) : (
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {selectedFile.slug}
                    </h2>
                  )}
                </div>
                <button
                  onClick={handleSaveFile}
                  disabled={isCreatingNew && !newFileName.trim()}
                  className="modern-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Сохранить
                </button>
              </div>
              
              <MarkdownEditor
                content={editingContent}
                onChange={setEditingContent}
                placeholder="Введите содержимое архитектурного документа..."
              />
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <DocumentIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Выберите документ для редактирования
                </h3>
                <p className="section-subtitle mb-8">
                  Выберите существующий документ из списка или создайте новый архитектурный документ
                </p>
                <button
                  onClick={startCreatingNew}
                  className="modern-button-primary flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Создать новый документ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}