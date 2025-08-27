'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, UserIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import MarkdownEditor from './MarkdownEditor';

export default function AgentsSection() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/files?directory=agents');
      const data = await response.json();
      setAgents(data.files || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading agents:', error);
      setLoading(false);
    }
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setEditingContent(agent.content);
    setIsCreatingNew(false);
  };

  const handleSaveAgent = async () => {
    try {
      const filename = selectedAgent ? selectedAgent.name : `${newAgentName}.md`;
      
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directory: 'agents',
          filename,
          content: editingContent
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadAgents();
        if (isCreatingNew) {
          setIsCreatingNew(false);
          setNewAgentName('');
        }
        // Find and select the updated/created agent
        const updatedAgents = await fetch('/api/files?directory=agents').then(r => r.json());
        const agent = updatedAgents.files.find(f => f.name === filename);
        if (agent) {
          setSelectedAgent(agent);
        }
      }
    } catch (error) {
      console.error('Error saving agent:', error);
    }
  };

  const handleDeleteAgent = async (filename) => {
    if (!confirm('Вы уверены, что хотите удалить этого агента?')) return;

    try {
      const response = await fetch(`/api/files?directory=agents&filename=${filename}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        await loadAgents();
        if (selectedAgent && selectedAgent.name === filename) {
          setSelectedAgent(null);
          setEditingContent('');
        }
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const startCreatingNew = () => {
    setIsCreatingNew(true);
    setSelectedAgent(null);
    setEditingContent(`# Новый агент

## Роль
Описание роли агента в проекте.

## Обязанности
- Основная обязанность 1
- Основная обязанность 2
- Основная обязанность 3

## Навыки
- Навык 1
- Навык 2
- Навык 3

## Инструменты
- Инструмент 1
- Инструмент 2

## Дополнительная информация
Любая дополнительная информация об агенте.
`);
    setNewAgentName('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="modern-card p-8 text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="section-subtitle">Загрузка агентов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="section-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <UserGroupIcon className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
            Агенты
          </h1>
          <p className="section-subtitle">Управление ролями и описаниями агентов</p>
        </div>
        <button
          onClick={startCreatingNew}
          className="modern-button-primary flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Новый агент
        </button>
      </div>

      <div className="content-grid">
        {/* Agents list */}
        <div className="modern-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <UserIcon className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Агенты ({agents.length})
            </h3>
          </div>
          
          {agents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <UserIcon className="h-8 w-8" style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p className="section-subtitle">Нет агентов</p>
            </div>
          ) : (
            <div className="space-y-2">
              {agents.map((agent) => (
                <div key={agent.name} className="flex items-center gap-2">
                  <button
                    onClick={() => handleAgentSelect(agent)}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      selectedAgent?.name === agent.name
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <UserIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium truncate">{agent.slug}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.name)}
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
          {(selectedAgent || isCreatingNew) ? (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex-1">
                  {isCreatingNew ? (
                    <input
                      type="text"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                      placeholder="Имя агента (без .md)"
                      className="modern-input w-full"
                    />
                  ) : (
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {selectedAgent.slug}
                    </h2>
                  )}
                </div>
                <button
                  onClick={handleSaveAgent}
                  disabled={isCreatingNew && !newAgentName.trim()}
                  className="modern-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Сохранить
                </button>
              </div>
              
              <MarkdownEditor
                content={editingContent}
                onChange={setEditingContent}
                placeholder="Введите описание агента..."
              />
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Выберите агента для редактирования
                </h3>
                <p className="section-subtitle mb-8">
                  Выберите существующего агента из списка или создайте нового
                </p>
                <button
                  onClick={startCreatingNew}
                  className="modern-button-primary flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Создать нового агента
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}