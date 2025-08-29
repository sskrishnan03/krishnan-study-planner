
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Screen } from '../types';
import { MenuIcon, XIcon, SunIcon, MoonIcon, BookOpenIcon, CalendarIcon, ClipboardListIcon, CollectionIcon, ChartBarIcon, ClockIcon } from './icons';

interface HeaderProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const navItems = [
    { name: 'Dashboard' as Screen, icon: <BookOpenIcon /> },
    { name: 'Subjects' as Screen, icon: <CollectionIcon /> },
    { name: 'Timetable' as Screen, icon: <CalendarIcon /> },
    { name: 'Assignments' as Screen, icon: <ClipboardListIcon /> },
    { name: 'Flashcards' as Screen, icon: <CollectionIcon /> },
    { name: 'Analytics' as Screen, icon: <ChartBarIcon /> },
    { name: 'Pomodoro Timer' as Screen, icon: <ClockIcon /> },
];

const Header: React.FC<HeaderProps> = ({ activeScreen, setActiveScreen, isDarkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLink: React.FC<{ screen: Screen, icon: React.ReactNode }> = ({ screen, icon }) => (
    <button
      onClick={() => {
        setActiveScreen(screen);
        setIsMenuOpen(false);
      }}
      className={`${
        activeScreen === screen
          ? 'text-primary-500 dark:text-primary-400'
          : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
      } relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors`}
    >
      {icon}
      <span>{screen}</span>
      {activeScreen === screen && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 dark:bg-primary-400"
          layoutId="underline"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
              Krishnan Planner
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map(item => <NavLink key={item.name} screen={item.name} icon={item.icon} />)}
          </nav>
          <div className="flex items-center">
             <button onClick={toggleDarkMode} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </button>
            <div className="md:hidden ml-2">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                {isMenuOpen ? <XIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
                 <button
                 key={item.name}
                 onClick={() => {
                   setActiveScreen(item.name);
                   setIsMenuOpen(false);
                 }}
                 className={`${
                   activeScreen === item.name
                     ? 'bg-primary-50 text-primary-600 dark:bg-gray-800 dark:text-primary-400'
                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                 } flex items-center gap-3 w-full px-3 py-2 rounded-md text-base font-medium`}
               >
                {item.icon}
                {item.name}
               </button>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;