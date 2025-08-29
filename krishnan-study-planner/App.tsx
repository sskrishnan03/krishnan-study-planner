
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Subjects from './components/Subjects';
import Timetable from './components/Timetable';
import Assignments from './components/Assignments';
import Flashcards from './components/Flashcards';
import Analytics from './components/Analytics';
import PomodoroTimer from './components/PomodoroTimer';
import type { Subject, Assignment, FlashcardSet, Task } from './types';
import { Screen } from './types';
import { DEFAULT_SUBJECTS, DEFAULT_ASSIGNMENTS, DEFAULT_FLASHCARDS, DEFAULT_TIMETABLE } from './constants';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false);
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Dashboard);
  
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', DEFAULT_SUBJECTS);
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>('assignments', DEFAULT_ASSIGNMENTS);
  const [flashcardSets, setFlashcardSets] = useLocalStorage<FlashcardSet[]>('flashcards', DEFAULT_FLASHCARDS);
  const [timetable, setTimetable] = useLocalStorage<Task[]>('timetable', DEFAULT_TIMETABLE);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.Dashboard:
        return <Dashboard subjects={subjects} assignments={assignments} setActiveScreen={setActiveScreen} />;
      case Screen.Subjects:
        return <Subjects subjects={subjects} setSubjects={setSubjects} />;
      case Screen.Timetable:
        return <Timetable tasks={timetable} setTasks={setTimetable} subjects={subjects} />;
      case Screen.Assignments:
        return <Assignments assignments={assignments} setAssignments={setAssignments} subjects={subjects} />;
      case Screen.Flashcards:
        return <Flashcards flashcardSets={flashcardSets} setFlashcardSets={setFlashcardSets} />;
      case Screen.Analytics:
        return <Analytics subjects={subjects} assignments={assignments} />;
      case Screen.Pomodoro:
        return <PomodoroTimer />;
      default:
        return <Dashboard subjects={subjects} assignments={assignments} setActiveScreen={setActiveScreen} />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300">
      <Header 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
