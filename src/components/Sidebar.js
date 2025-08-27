'use client';

import { useState } from 'react';
import {
  Squares2X2Icon,
  UserGroupIcon,
  DocumentTextIcon,
  ViewColumnsIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Архитектура', href: '/architecture', icon: Squares2X2Icon },
  { name: 'Агенты', href: '/agents', icon: UserGroupIcon },
  { name: 'User Stories', href: '/stories', icon: DocumentTextIcon },
  { name: 'Kanban', href: '/kanban', icon: ViewColumnsIcon },
];

export default function Sidebar({ currentPath, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile menu */}
      <div className={`lg:hidden ${sidebarOpen ? 'relative z-50' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button 
                onClick={() => setSidebarOpen(false)}
                className="modern-button-secondary p-3"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="modern-sidebar flex grow flex-col px-6 py-8">
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Claude</h1>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Workflow Manager</p>
                  </div>
                </div>
              </div>
              
              <nav className="flex-1">
                <ul className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = currentPath === item.href;
                    return (
                      <li key={item.name}>
                        <button
                          onClick={() => {
                            onNavigate(item.href);
                            setSidebarOpen(false);
                          }}
                          className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span>{item.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              
              <div className="pt-8 border-t border-slate-200">
                <p className="text-xs text-slate-400 text-center">
                  v1.0.0 · Local Workflow Management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="modern-sidebar flex grow flex-col px-8 py-8">
          <div className="mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Claude</h1>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Workflow Manager</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => onNavigate(item.href)}
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          <div className="pt-8 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
              v1.0.0 · Local Workflow Management
            </p>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 lg:hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="modern-button-secondary p-3"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Claude Workflow Manager
          </div>
          <div className="w-12"></div>
        </div>
      </div>
    </>
  );
}