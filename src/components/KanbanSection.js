'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusIcon, UserIcon, CalendarIcon, DocumentTextIcon, ClockIcon, LinkIcon } from '@heroicons/react/24/outline';

const COLUMN_CONFIG = {
  backlog: { title: 'Backlog', color: 'bg-gray-100 border-gray-300' },
  'in-progress': { title: 'In Progress', color: 'bg-blue-100 border-blue-300' },
  review: { title: 'Review', color: 'bg-yellow-100 border-yellow-300' },
  done: { title: 'Done', color: 'bg-green-100 border-green-300' }
};

function TaskCard({ task, isOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing ${
        isOverlay ? 'rotate-3 shadow-lg' : 'hover:shadow-md'
      }`}
    >
      <div className="text-xs text-gray-500 mb-1">
        ID: {task.id.replace('task-', '')}
      </div>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm flex-1">{task.title}</h4>
        {task.story && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
            {task.story.replace('story-', '').replace('-', ' ')}
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Dependencies */}
      {task.dependencies && task.dependencies.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center text-xs text-orange-600 mb-1">
            <LinkIcon className="h-3 w-3 mr-1" />
            Зависимости:
          </div>
          <div className="text-xs text-gray-600">
            {task.dependencies.map(dep => dep.replace('task-', '')).join(', ')}
          </div>
        </div>
      )}

      {/* Files */}
      {task.files && task.files.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center text-xs text-purple-600 mb-1">
            <DocumentTextIcon className="h-3 w-3 mr-1" />
            Файлы: {task.files.length}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          {task.agent && (
            <div className="flex items-center">
              <UserIcon className="h-3 w-3 mr-1" />
              {task.agent}
            </div>
          )}
          {task.estimatedHours && (
            <div className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              {task.estimatedHours}ч
            </div>
          )}
        </div>
        {task.createdAt && (
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {new Date(task.createdAt).toLocaleDateString('ru')}
          </div>
        )}
      </div>
    </div>
  );
}

function DroppableColumn({ column, tasks, agents }) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: column,
  });

  const config = COLUMN_CONFIG[column];

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-96 ${config.color} rounded-lg p-4 ${
        isOver ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">{config.title}</h3>
        <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanSection() {
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    agent: '',
    status: 'backlog'
  });
  const [filterAgent, setFilterAgent] = useState('all');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadData();
    }, 30000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(refreshInterval);
  }, []);

  const loadData = async () => {
    try {
      // Load tasks
      const tasksResponse = await fetch('/api/tasks');
      const tasksData = await tasksResponse.json();
      setTasks(tasksData.tasks || []);

      // Load agents
      const agentsResponse = await fetch('/api/files?directory=agents');
      const agentsData = await agentsResponse.json();
      setAgents(agentsData.files || []);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // If dropping on a column
    if (Object.keys(COLUMN_CONFIG).includes(overId)) {
      const updatedTasks = tasks.map(task => 
        task.id === activeId 
          ? { ...task, status: overId, updatedAt: new Date().toISOString() }
          : task
      );
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      return;
    }

    // If reordering within the same column
    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask || !overTask) return;

    if (activeTask.status === overTask.status) {
      const columnTasks = tasks.filter(t => t.status === activeTask.status);
      const activeIndex = columnTasks.findIndex(t => t.id === activeId);
      const overIndex = columnTasks.findIndex(t => t.id === overId);

      const reorderedColumnTasks = arrayMove(columnTasks, activeIndex, overIndex);
      const otherTasks = tasks.filter(t => t.status !== activeTask.status);

      const updatedTasks = [...otherTasks, ...reorderedColumnTasks];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: updatedTasks,
          columns: Object.keys(COLUMN_CONFIG),
          lastModified: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    const task = {
      id: `task-${Date.now()}`,
      ...newTask,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);

    setNewTask({
      title: '',
      description: '',
      agent: '',
      status: 'backlog'
    });
    setShowNewTaskModal(false);
  };

  const filteredTasks = filterAgent === 'all' 
    ? tasks 
    : tasks.filter(task => task.agent === filterAgent);

  const getTasksByColumn = (column) => {
    return filteredTasks.filter(task => task.status === column);
  };

  const activeTask = tasks.find(task => task.id === activeId);

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
        <h1 className="text-2xl font-bold text-gray-900">📊 Kanban</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="all">Все агенты</option>
            {agents.map(agent => (
              <option key={agent.slug} value={agent.slug}>
                {agent.slug}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Новая задача
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {Object.keys(COLUMN_CONFIG).map(column => (
            <DroppableColumn
              key={column}
              column={column}
              tasks={getTasksByColumn(column)}
              agents={agents}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay={true} /> : null}
        </DragOverlay>
      </DndContext>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Новая задача</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Введите название задачи"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Описание</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Описание задачи"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Агент</label>
                <select
                  value={newTask.agent}
                  onChange={(e) => setNewTask({...newTask, agent: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Выберите агента</option>
                  {agents.map(agent => (
                    <option key={agent.slug} value={agent.slug}>
                      {agent.slug}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Статус</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Object.entries(COLUMN_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
