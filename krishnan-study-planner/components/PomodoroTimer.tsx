import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, RefreshIcon } from './icons';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const PomodoroTimer: React.FC = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<TimerMode>('work');
    const [cycles, setCycles] = useState(0);

    const totalSeconds = minutes * 60 + seconds;
    const duration = (mode === 'work' ? 25 : mode === 'shortBreak' ? 5 : 15) * 60;
    const progress = (duration - totalSeconds) / duration;

    const switchMode = useCallback((newMode: TimerMode) => {
      setIsActive(false);
      setMode(newMode);
      switch(newMode) {
        case 'work':
          setMinutes(25);
          break;
        case 'shortBreak':
          setMinutes(5);
          break;
        case 'longBreak':
          setMinutes(15);
          break;
      }
      setSeconds(0);
    }, []);

    useEffect(() => {
        // fix: Use ReturnType<typeof setInterval> for browser compatibility instead of NodeJS.Timeout
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                } else if (minutes > 0) {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                } else { // Timer finished
                    if (mode === 'work') {
                        const newCycles = cycles + 1;
                        setCycles(newCycles);
                        switchMode(newCycles % 4 === 0 ? 'longBreak' : 'shortBreak');
                    } else {
                        switchMode('work');
                    }
                }
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            if (interval) clearInterval(interval);
        }
        return () => { if(interval) clearInterval(interval) };
    }, [isActive, seconds, minutes, mode, cycles, switchMode]);
    
    const toggle = () => setIsActive(!isActive);

    const reset = () => {
        setIsActive(false);
        setCycles(0);
        switchMode('work');
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center">
            <div className="flex space-x-2 mb-8">
                {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
                    <button key={m} onClick={() => switchMode(m)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${mode === m ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        {m === 'work' ? 'Pomodoro' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </button>
                ))}
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="120" strokeWidth="10" stroke="#e5e7eb" fill="none" className="dark:stroke-gray-700"/>
                    <motion.circle
                        cx="50%" cy="50%" r="120"
                        strokeWidth="10"
                        stroke="#3b82f6"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 120}
                        strokeDashoffset={2 * Math.PI * 120 * (1 - progress)}
                        initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress) }}
                        transition={{ duration: 1, ease: "linear" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="z-10">
                    <h2 className="text-6xl font-bold tracking-tighter text-gray-800 dark:text-gray-100">
                        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                    </h2>
                </div>
            </div>

            <div className="flex space-x-4 mt-8">
                <button onClick={toggle} className="px-10 py-3 text-lg font-bold text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors shadow-lg">
                    {isActive ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button onClick={reset} className="p-4 text-gray-500 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-lg">
                    <RefreshIcon />
                </button>
            </div>
            <p className="mt-4 text-sm text-gray-400">Cycles completed: {cycles}</p>
        </div>
    );
};

export default PomodoroTimer;