
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Subject, Assignment } from '../types';
import { Screen, AssignmentStatus } from '../types';
import { MOTIVATIONAL_QUOTES } from '../constants';
import { CheckCircleIcon, ClockIcon, ExclamationIcon, ArrowRightIcon } from './icons';

interface DashboardProps {
    subjects: Subject[];
    assignments: Assignment[];
    setActiveScreen: (screen: Screen) => void;
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

const SubjectProgressCard: React.FC<{ subject: Subject, onClick: () => void }> = ({ subject, onClick }) => {
    const completedTopics = subject.topics.filter(t => t.completed).length;
    const totalTopics = subject.topics.length;
    const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return (
        <motion.div
            variants={itemVariants}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg" style={{ color: subject.color }}>{subject.name}</h3>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{progress}%</span>
            </div>
            <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: subject.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{completedTopics} / {totalTopics} topics completed</p>
        </motion.div>
    );
};

const UpcomingAssignmentCard: React.FC<{ assignment: Assignment, subject?: Subject, onClick: () => void }> = ({ assignment, subject, onClick }) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now && assignment.status !== AssignmentStatus.Completed;
    
    let statusIcon, statusColor;
    switch (assignment.status) {
        case AssignmentStatus.Completed:
            statusIcon = <CheckCircleIcon className="text-green-500" />;
            statusColor = "text-green-500";
            break;
        case AssignmentStatus.Overdue:
             statusIcon = <ExclamationIcon className="text-red-500" />;
             statusColor = "text-red-500";
             break;
        default:
             statusIcon = isOverdue ? <ExclamationIcon className="text-red-500" /> : <ClockIcon className="text-yellow-500" />;
             statusColor = isOverdue ? "text-red-500" : "text-yellow-500";
    }

    return (
        <motion.li
            variants={itemVariants}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <div style={{color: subject?.color}}>{statusIcon}</div>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{assignment.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400" style={{ color: subject?.color }}>{subject?.name || 'Uncategorized'}</p>
                </div>
            </div>
            <p className={`text-sm font-medium ${statusColor}`}>{new Date(assignment.dueDate).toLocaleDateString()}</p>
        </motion.li>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ subjects, assignments, setActiveScreen }) => {
    const quote = useMemo(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)], []);
    const upcomingAssignments = useMemo(() => {
        return assignments
            .filter(a => a.status !== AssignmentStatus.Completed)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 3);
    }, [assignments]);
    
    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <motion.div variants={itemVariants} className="p-6 bg-primary-500 text-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold">Welcome Back!</h2>
                <p className="mt-2 italic">"{quote}"</p>
            </motion.div>

            <motion.div variants={containerVariants}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Subject Progress</h2>
                    <button onClick={() => setActiveScreen(Screen.Subjects)} className="flex items-center gap-1 text-sm text-primary-500 hover:underline">
                        View All <ArrowRightIcon />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map(subject => (
                        <SubjectProgressCard key={subject.id} subject={subject} onClick={() => setActiveScreen(Screen.Subjects)} />
                    ))}
                </div>
            </motion.div>

            <motion.div variants={containerVariants}>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Upcoming Assignments</h2>
                    <button onClick={() => setActiveScreen(Screen.Assignments)} className="flex items-center gap-1 text-sm text-primary-500 hover:underline">
                        View All <ArrowRightIcon />
                    </button>
                </div>
                <ul className="space-y-3">
                     {upcomingAssignments.length > 0 ? (
                        upcomingAssignments.map(assignment => {
                            const subject = subjects.find(s => s.id === assignment.subjectId);
                            return <UpcomingAssignmentCard key={assignment.id} assignment={assignment} subject={subject} onClick={() => setActiveScreen(Screen.Assignments)} />;
                        })
                     ) : (
                        <motion.p variants={itemVariants} className="text-center text-gray-500 dark:text-gray-400 py-4">No upcoming assignments. Great job!</motion.p>
                     )}
                </ul>
            </motion.div>

        </motion.div>
    );
};

export default Dashboard;
