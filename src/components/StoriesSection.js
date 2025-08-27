'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, DocumentTextIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import MarkdownEditor from './MarkdownEditor';

export default function StoriesSection() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newStoryName, setNewStoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [extractedTasks, setExtractedTasks] = useState([]);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await fetch('/api/files?directory=stories');
      const data = await response.json();
      setStories(data.files || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stories:', error);
      setLoading(false);
    }
  };

  const handleStorySelect = (story) => {
    setSelectedStory(story);
    setEditingContent(story.content);
    setIsCreatingNew(false);
    extractTasksFromContent(story.content);
  };

  const extractTasksFromContent = (content) => {
    // Extract tasks from markdown content (looking for list items)
    const lines = content.split('\n');
    const tasks = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)) {
        const task = trimmed.replace(/^[-*]\s/, '').replace(/^\d+\.\s/, '').trim();
        if (task && !task.startsWith('#') && task.length > 5) {
          tasks.push({
            id: `task-${index}`,
            title: task,
            description: `Из story: ${selectedStory?.slug || 'Новая story'}`,
            status: 'backlog',
            agent: null,
            createdAt: new Date().toISOString()
          });
        }
      }
    });
    
    setExtractedTasks(tasks);
  };

  const handleSaveStory = async () => {
    try {
      const filename = selectedStory ? selectedStory.name : `${newStoryName}.md`;
      
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directory: 'stories',
          filename,
          content: editingContent
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadStories();
        if (isCreatingNew) {
          setIsCreatingNew(false);
          setNewStoryName('');
        }
        // Find and select the updated/created story
        const updatedStories = await fetch('/api/files?directory=stories').then(r => r.json());
        const story = updatedStories.files.find(f => f.name === filename);
        if (story) {
          setSelectedStory(story);
          extractTasksFromContent(editingContent);
        }
      }
    } catch (error) {
      console.error('Error saving story:', error);
    }
  };

  const handleDeleteStory = async (filename) => {
    if (!confirm('Вы уверены, что хотите удалить эту story?')) return;

    try {
      const response = await fetch(`/api/files?directory=stories&filename=${filename}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        await loadStories();
        if (selectedStory && selectedStory.name === filename) {
          setSelectedStory(null);
          setEditingContent('');
          setExtractedTasks([]);
        }
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const handleExportTasks = async () => {
    if (extractedTasks.length === 0) return;

    try {
      // Get current tasks
      const response = await fetch('/api/tasks');
      const currentTasks = await response.json();
      
      // Add new tasks
      const updatedTasks = {
        ...currentTasks,
        tasks: [...(currentTasks.tasks || []), ...extractedTasks]
      };

      // Save updated tasks
      const saveResponse = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTasks)
      });

      const result = await saveResponse.json();
      if (result.success) {
        alert(`Экспортировано ${extractedTasks.length} задач в Kanban`);
        setExtractedTasks([]); // Clear extracted tasks after export
      }
    } catch (error) {
      console.error('Error exporting tasks:', error);
      alert('Ошибка при экспорте задач');
    }
  };

  const startCreatingNew = () => {
    setIsCreatingNew(true);
    setSelectedStory(null);
    setEditingContent(`# User Story: [Название]

## Описание
Как [роль пользователя], я хочу [цель], чтобы [причина/выгода].

## Критерии приемки
- [ ] Критерий 1
- [ ] Критерий 2
- [ ] Критерий 3

## Задачи
- Задача 1: Описание
- Задача 2: Описание
- Задача 3: Описание

## Дополнительные заметки
Любая дополнительная информация, контекст или требования.

## Приоритет
- [ ] Высокий
- [x] Средний
- [ ] Низкий
`);
    setNewStoryName('');
    setExtractedTasks([]);
  };

  useEffect(() => {
    if (editingContent && selectedStory) {
      extractTasksFromContent(editingContent);
    }
  }, [editingContent, selectedStory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">📝 User Stories</h1>
        <button
          onClick={startCreatingNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Новая story
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stories list */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Stories ({stories.length})
              </h3>
              {stories.length === 0 ? (
                <p className="text-gray-500 text-sm">Нет stories</p>
              ) : (
                <ul className="space-y-2">
                  {stories.map((story) => (
                    <li key={story.name}>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleStorySelect(story)}
                          className={`flex-1 flex items-center px-3 py-2 text-left text-sm rounded-md ${
                            selectedStory?.name === story.name
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <DocumentTextIcon className="mr-2 h-4 w-4" />
                          {story.slug}
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story.name)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Extracted tasks */}
          {extractedTasks.length > 0 && (
            <div className="mt-4 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Задачи ({extractedTasks.length})
                  </h3>
                  <button
                    onClick={handleExportTasks}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                  >
                    <ArrowRightIcon className="-ml-0.5 mr-1 h-4 w-4" />
                    В Kanban
                  </button>
                </div>
                <ul className="space-y-2">
                  {extractedTasks.map((task, index) => (
                    <li key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {task.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {(selectedStory || isCreatingNew) ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isCreatingNew ? (
                      <input
                        type="text"
                        value={newStoryName}
                        onChange={(e) => setNewStoryName(e.target.value)}
                        placeholder="Название story (без .md)"
                        className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      selectedStory.slug
                    )}
                  </h3>
                  <button
                    onClick={handleSaveStory}
                    disabled={isCreatingNew && !newStoryName.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                  >
                    Сохранить
                  </button>
                </div>
                
                <MarkdownEditor
                  content={editingContent}
                  onChange={setEditingContent}
                  placeholder="Введите содержимое user story..."
                />
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Выберите story для редактирования
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Выберите существующую story из списка или создайте новую
                </p>
                <div className="mt-6">
                  <button
                    onClick={startCreatingNew}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Создать новую story
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}