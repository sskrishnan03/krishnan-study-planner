import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject, Topic } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, CollectionIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface SubjectsProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const Subjects: React.FC<SubjectsProps> = ({ subjects, setSubjects }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectColor, setSubjectColor] = useState('#60a5fa');
  const [newTopicName, setNewTopicName] = useState('');
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(subjects[0]?.id || null);
  const [sortBy, setSortBy] = useState<'name' | 'progress'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    onConfirm: () => void;
    title: string;
    message: string;
  }>({
    isOpen: false,
    onConfirm: () => {},
    title: '',
    message: ''
  });

  const activeSubject = subjects.find(s => s.id === activeSubjectId);
  const progress = activeSubject && activeSubject.topics.length > 0 ? Math.round((activeSubject.topics.filter(t => t.completed).length / activeSubject.topics.length) * 100) : 0;
  
  const sortedSubjects = useMemo(() => {
    const getProgress = (subject: Subject) => {
      const totalTopics = subject.topics.length;
      if (totalTopics === 0) return 0;
      const completedTopics = subject.topics.filter(t => t.completed).length;
      return (completedTopics / totalTopics) * 100;
    };

    return [...subjects].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else { // sortBy === 'progress'
        comparison = getProgress(a) - getProgress(b);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [subjects, sortBy, sortOrder]);
  
  const handleAddOrUpdateSubject = () => {
    if (!subjectName.trim()) return;
    if (editingSubject) {
      setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...s, name: subjectName, color: subjectColor } : s));
    } else {
      const newSubject: Subject = {
        id: Date.now().toString(),
        name: subjectName,
        color: subjectColor,
        topics: [],
      };
      setSubjects([...subjects, newSubject]);
      setActiveSubjectId(newSubject.id);
    }
    closeModal();
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setSubjectColor(subject.color);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setSubjectName('');
    setSubjectColor('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subjectId: string, subjectName: string) => {
    setConfirmModalState({
      isOpen: true,
      onConfirm: () => {
        setSubjects(subjects.filter(s => s.id !== subjectId));
        if (activeSubjectId === subjectId) {
            setActiveSubjectId(subjects.length > 1 ? subjects.filter(s => s.id !== subjectId)[0].id : null);
        }
      },
      title: 'Delete Subject',
      message: `Are you sure you want to delete "${subjectName}"? All associated topics will be removed, and related assignments will become uncategorized.`
    });
  };
  
  const handleAddTopic = () => {
    if(!newTopicName.trim() || !activeSubjectId) return;
    const newTopic: Topic = { id: Date.now().toString(), name: newTopicName, completed: false };
    setSubjects(subjects.map(s => s.id === activeSubjectId ? {...s, topics: [...s.topics, newTopic]} : s));
    setNewTopicName('');
  };

  const toggleTopicCompletion = (topicId: string) => {
    if(!activeSubjectId) return;
    setSubjects(subjects.map(s => s.id === activeSubjectId ? { ...s, topics: s.topics.map(t => t.id === topicId ? {...t, completed: !t.completed} : t)} : s));
  }

  const handleDeleteTopic = (topicId: string, topicName: string) => {
    if(!activeSubjectId) return;
    setConfirmModalState({
      isOpen: true,
      onConfirm: () => {
        setSubjects(subjects.map(s => s.id === activeSubjectId ? { ...s, topics: s.topics.filter(t => t.id !== topicId)} : s));
      },
      title: 'Delete Topic',
      message: `Are you sure you want to delete the topic "${topicName}"?`
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Subjects List */}
      <div className="md:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Subjects</h2>
          <button onClick={openAddModal} className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
            <PlusIcon />
          </button>
        </div>
        <div className="flex items-center gap-4 mb-4 text-sm">
            <label htmlFor="sort-by" className="font-medium text-gray-600 dark:text-gray-400">Sort by:</label>
            <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'progress')}
                className="p-1 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            >
                <option value="name">Name</option>
                <option value="progress">Progress</option>
            </select>
            <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
                {sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </button>
        </div>
        <motion.ul layout className="space-y-2">
          <AnimatePresence>
          {sortedSubjects.map(subject => (
            <motion.li
              key={subject.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => setActiveSubjectId(subject.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all flex justify-between items-center group ${activeSubjectId === subject.id ? 'bg-primary-100 dark:bg-primary-900/50 ring-2 ring-primary-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <div className="flex items-center gap-3">
                 <span className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }}></span>
                 <span className="font-medium text-gray-800 dark:text-gray-200">{subject.name}</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                 <button onClick={() => openEditModal(subject)} className="text-gray-400 hover:text-blue-500"><PencilIcon/></button>
                 <button onClick={() => handleDeleteSubject(subject.id, subject.name)} className="text-gray-400 hover:text-red-500"><TrashIcon/></button>
              </div>
            </motion.li>
          ))}
          </AnimatePresence>
        </motion.ul>
      </div>

      {/* Topics View */}
      <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {activeSubject ? (
          <>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <h3 className="text-2xl font-bold" style={{ color: activeSubject.color }}>{activeSubject.name}</h3>
               <div className="mt-2 h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                <motion.div
                    className="h-2.5 rounded-full"
                    style={{ backgroundColor: activeSubject.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{progress}% Complete</p>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Add a new topic..."
                className="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
              />
              <button onClick={handleAddTopic} className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">Add</button>
            </div>

            <motion.ul layout className="space-y-3">
                <AnimatePresence>
                {activeSubject.topics.map(topic => (
                    <motion.li 
                        key={topic.id} 
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            <button onClick={() => toggleTopicCompletion(topic.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${topic.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-500'}`}>
                                {topic.completed && <CheckIcon className="text-white"/>}
                            </button>
                            <span className={`${topic.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{topic.name}</span>
                        </div>
                        <button onClick={() => handleDeleteTopic(topic.id, topic.name)} className="text-gray-400 hover:text-red-500">
                           <TrashIcon/>
                        </button>
                    </motion.li>
                ))}
                </AnimatePresence>
            </motion.ul>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
             <CollectionIcon className="w-16 h-16 mb-4"/>
             <h3 className="text-xl font-semibold">Select a subject</h3>
             <p>Or create a new one to start adding topics.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h3 className="text-lg font-bold mb-4">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="Subject Name"
            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
          />
          <div className="flex items-center gap-4">
             <label htmlFor="subjectColor" className="font-medium text-gray-700 dark:text-gray-300">Color:</label>
             <input
                id="subjectColor"
                type="color"
                value={subjectColor}
                onChange={(e) => setSubjectColor(e.target.value)}
                className="w-10 h-10 p-1 border rounded-md cursor-pointer bg-white dark:bg-gray-700 dark:border-gray-600"
              />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button onClick={handleAddOrUpdateSubject} className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">{editingSubject ? 'Save Changes' : 'Add Subject'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal 
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState({ ...confirmModalState, isOpen: false })}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        message={confirmModalState.message}
      />
    </div>
  );
};

export default Subjects;