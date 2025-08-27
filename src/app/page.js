'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ArchitectureSection from '@/components/ArchitectureSection';
import AgentsSection from '@/components/AgentsSection';
import StoriesSection from '@/components/StoriesSection';
import KanbanSection from '@/components/KanbanSection';

export default function Home() {
  const [currentPath, setCurrentPath] = useState('/architecture');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize Claude structure on app start
    fetch('/api/init', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setInitialized(true);
        } else {
          console.error('Failed to initialize:', data.error);
        }
      })
      .catch(err => console.error('Init error:', err));
  }, []);

  const renderCurrentSection = () => {
    switch (currentPath) {
      case '/architecture':
        return <ArchitectureSection />;
      case '/agents':
        return <AgentsSection />;
      case '/stories':
        return <StoriesSection />;
      case '/kanban':
        return <KanbanSection />;
      default:
        return <ArchitectureSection />;
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="modern-card p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-white font-bold text-2xl animate-pulse">C</span>
          </div>
          <div className="loading-spinner mx-auto mb-6"></div>
          <h2 className="section-title text-xl mb-2">Инициализация</h2>
          <p className="section-subtitle">Настройка структуры проекта...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} />
      
      <div className="lg:ml-72">
        <main className="p-8 lg:p-12">
          <div className="animate-fade-in">
            {renderCurrentSection()}
          </div>
        </main>
      </div>
    </div>
  );
}