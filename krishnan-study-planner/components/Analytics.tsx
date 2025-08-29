
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import type { Subject, Assignment } from '../types';
import { AssignmentStatus } from '../types';
import { getStudySuggestions } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface AnalyticsProps {
  subjects: Subject[];
  assignments: Assignment[];
}

const Analytics: React.FC<AnalyticsProps> = ({ subjects, assignments }) => {
    const [aiSuggestions, setAiSuggestions] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const subjectProgressData = subjects.map(subject => {
        const completed = subject.topics.filter(t => t.completed).length;
        const total = subject.topics.length;
        return {
            name: subject.name,
            progress: total > 0 ? (completed / total) * 100 : 0,
            color: subject.color
        };
    });

    const completedAssignments = assignments.filter(a => a.status === AssignmentStatus.Completed).length;
    const pendingAssignments = assignments.filter(a => a.status === AssignmentStatus.Pending).length;
    const overdueAssignments = assignments.filter(a => new Date(a.dueDate) < new Date() && a.status !== AssignmentStatus.Completed).length;
    
    const overallProgress = subjects.length > 0 ? subjectProgressData.reduce((acc, s) => acc + s.progress, 0) / subjects.length : 0;

    const handleGetSuggestions = async () => {
        setIsLoading(true);
        const suggestions = await getStudySuggestions(subjects);
        setAiSuggestions(suggestions);
        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Your Progress & Analytics</h2>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Overall Progress</h3>
                    <p className="text-4xl font-bold text-primary-500">{Math.round(overallProgress)}%</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Completed Assignments</h3>
                    <p className="text-4xl font-bold text-green-500">{completedAssignments}</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Pending / Overdue</h3>
                    <p className="text-4xl font-bold">
                        <span className="text-yellow-500">{pendingAssignments}</span> / <span className="text-red-500">{overdueAssignments}</span>
                    </p>
                </div>
            </div>

            {/* Subject Progress Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Subject Completion</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={subjectProgressData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" />
                            <YAxis unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', color: '#fff', borderRadius: '0.5rem' }} />
                            <Bar dataKey="progress" name="Progress (%)" unit="%" fill="#3b82f6" >
                                {subjectProgressData.map((entry, index) => (
                                    <rect key={`cell-${index}`} fill={entry.color} x={0} y={0} width={0} height={0}/>
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">AI-Powered Study Suggestions</h3>
                    <button onClick={handleGetSuggestions} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-primary-500 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                        <SparklesIcon />
                        {isLoading ? 'Thinking...' : 'Get Suggestions'}
                    </button>
                </div>
                 {isLoading && <div className="text-center p-4">Loading suggestions...</div>}
                 {aiSuggestions && !isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose prose-sm dark:prose-invert max-w-none p-4 bg-primary-50 dark:bg-gray-900 rounded-md whitespace-pre-wrap font-mono"
                    >
                      {aiSuggestions.split('\n').map((line, index) => <p key={index} className="!my-1">{line}</p>)}
                    </motion.div>
                 )}
                 {!aiSuggestions && !isLoading && (
                    <div className="text-center text-gray-500 py-4">
                        Click the button to get personalized study tips based on your progress.
                    </div>
                 )}
            </div>

        </div>
    );
};

export default Analytics;
