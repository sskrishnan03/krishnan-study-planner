import React, { useState } from 'react';
import type { Task, Subject } from '../types';
import Modal from './Modal';
import { PlusIcon, TrashIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

interface TimetableProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  subjects: Subject[];
}

const daysOfWeek: Task['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 15 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`); // 7 AM to 9 PM

const Timetable: React.FC<TimetableProps> = ({ tasks, setTasks, subjects }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
        title: '',
        subjectId: subjects[0]?.id || '',
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00'
    });
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

    const handleAddTask = () => {
        if (!newTask.title || !newTask.subjectId) return;
        const finalTask: Task = { id: Date.now().toString(), ...newTask };
        setTasks([...tasks, finalTask]);
        setIsModalOpen(false);
        setNewTask({ title: '', subjectId: subjects[0]?.id || '', day: 'Monday', startTime: '09:00', endTime: '10:00' });
    };
    
    const handleDeleteTask = (taskId: string, taskTitle: string) => {
        setConfirmModalState({
            isOpen: true,
            onConfirm: () => setTasks(tasks.filter(t => t.id !== taskId)),
            title: 'Delete Timetable Task',
            message: `Are you sure you want to delete the task "${taskTitle}"?`
        });
    }

    const getTaskStyle = (task: Task, subject?: Subject) => {
        const start = timeSlots.indexOf(task.startTime);
        const end = timeSlots.indexOf(task.endTime);
        if (start === -1 || end === -1) return {};
        
        const duration = end - start;
        return {
            gridRowStart: start + 2,
            gridRowEnd: start + 2 + duration,
            backgroundColor: subject?.color ? `${subject.color}33` : '#e0e0e0', // with opacity
            borderColor: subject?.color || '#a0a0a0',
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Weekly Timetable</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
                    <PlusIcon /> Add Task
                </button>
            </div>
            <div className="overflow-x-auto">
                <div className="grid grid-cols-8 min-w-[1000px]" style={{ gridTemplateRows: `auto repeat(${timeSlots.length}, 4rem)` }}>
                    {/* Time column */}
                    <div className="sticky left-0 bg-white dark:bg-gray-800 z-10"></div>
                    {timeSlots.map(time => (
                       <div key={time} className="row-start-1 col-start-1 row-span-1 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400" style={{gridRow: timeSlots.indexOf(time) + 2}}>
                           {time}
                       </div>
                    ))}
                    
                    {daysOfWeek.map((day, dayIndex) => (
                        <React.Fragment key={day}>
                            {/* Header */}
                            <div className="col-start-2 sticky top-0 bg-white dark:bg-gray-800 z-10 text-center font-bold p-2 border-b border-gray-200 dark:border-gray-700" style={{gridColumn: dayIndex + 2}}>{day}</div>
                            {/* Grid lines */}
                            {timeSlots.map((_, timeIndex) => (
                                <div key={`${day}-${timeIndex}`} className="border-r border-b border-gray-200 dark:border-gray-700" style={{ gridColumn: dayIndex + 2, gridRow: timeIndex + 2 }}></div>
                            ))}
                            {/* Tasks */}
                            {tasks.filter(t => t.day === day).map(task => {
                                const subject = subjects.find(s => s.id === task.subjectId);
                                return (
                                    <div 
                                        key={task.id} 
                                        className="relative p-2 border-l-4 rounded-md m-1 flex flex-col justify-between"
                                        style={{ ...getTaskStyle(task, subject), gridColumn: dayIndex + 2 }}
                                    >
                                        <div>
                                          <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{task.title}</p>
                                          <p className="text-xs text-gray-600 dark:text-gray-300" style={{color: subject?.color}}>{subject?.name}</p>
                                        </div>
                                        <button onClick={() => handleDeleteTask(task.id, task.title)} className="absolute top-1 right-1 opacity-50 hover:opacity-100"><TrashIcon className="w-4 h-4 text-red-500"/></button>
                                    </div>
                                )
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h3 className="text-lg font-bold mb-4">Add Timetable Task</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <select value={newTask.subjectId} onChange={e => setNewTask({...newTask, subjectId: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={newTask.day} onChange={e => setNewTask({...newTask, day: e.target.value as Task['day']})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                         <input type="time" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                         <input type="time" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div className="flex justify-end gap-2">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                        <button onClick={handleAddTask} className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">Add Task</button>
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

export default Timetable;