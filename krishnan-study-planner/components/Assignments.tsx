import React, { useState, useMemo } from 'react';
import type { Assignment, Subject } from '../types';
import { AssignmentStatus } from '../types';
import Modal from './Modal';
import { PlusIcon, TrashIcon, PencilIcon, CheckCircleIcon, ClockIcon, ExclamationIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

interface AssignmentsProps {
    assignments: Assignment[];
    setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
    subjects: Subject[];
}

const AssignmentCard: React.FC<{
    assignment: Assignment;
    subject?: Subject;
    onEdit: (assignment: Assignment) => void;
    onDelete: (id: string, title: string) => void;
    onStatusChange: (id: string, status: AssignmentStatus) => void;
}> = ({ assignment, subject, onEdit, onDelete, onStatusChange }) => {
    
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    now.setHours(0,0,0,0);
    dueDate.setHours(0,0,0,0);
    const isOverdue = dueDate < now && assignment.status !== AssignmentStatus.Completed;
    const currentStatus = isOverdue ? AssignmentStatus.Overdue : assignment.status;

    let statusInfo = { icon: <ClockIcon />, color: 'text-yellow-500' };
    if (currentStatus === AssignmentStatus.Completed) {
        statusInfo = { icon: <CheckCircleIcon />, color: 'text-green-500' };
    } else if (currentStatus === AssignmentStatus.Overdue) {
        statusInfo = { icon: <ExclamationIcon />, color: 'text-red-500' };
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{assignment.title}</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(assignment)} className="text-gray-400 hover:text-blue-500"><PencilIcon/></button>
                        <button onClick={() => onDelete(assignment.id, assignment.title)} className="text-gray-400 hover:text-red-500"><TrashIcon/></button>
                    </div>
                </div>
                <p className="text-sm font-medium mb-2" style={{color: subject?.color}}>{subject?.name || 'Uncategorized'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className={`flex items-center gap-2 text-sm font-semibold ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span>{currentStatus}</span>
                </div>
                <select 
                    value={assignment.status} 
                    onChange={e => onStatusChange(assignment.id, e.target.value as AssignmentStatus)}
                    className="p-1 text-xs border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value={AssignmentStatus.Pending}>Pending</option>
                    <option value={AssignmentStatus.Completed}>Completed</option>
                </select>
            </div>
        </div>
    );
};


const Assignments: React.FC<AssignmentsProps> = ({ assignments, setAssignments, subjects }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [formData, setFormData] = useState({ title: '', subjectId: '', dueDate: '' });
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

    const openAddModal = () => {
        setEditingAssignment(null);
        setFormData({ title: '', subjectId: subjects[0]?.id || '', dueDate: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const openEditModal = (assignment: Assignment) => {
        setEditingAssignment(assignment);
        setFormData({ title: assignment.title, subjectId: assignment.subjectId, dueDate: new Date(assignment.dueDate).toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.title || !formData.subjectId || !formData.dueDate) return;
        if (editingAssignment) {
            setAssignments(assignments.map(a => a.id === editingAssignment.id ? { ...a, ...formData, dueDate: new Date(formData.dueDate).toISOString() } : a));
        } else {
            const newAssignment: Assignment = {
                id: Date.now().toString(),
                ...formData,
                dueDate: new Date(formData.dueDate).toISOString(),
                status: AssignmentStatus.Pending,
            };
            setAssignments([...assignments, newAssignment]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string, title: string) => {
        setConfirmModalState({
            isOpen: true,
            onConfirm: () => setAssignments(assignments.filter(a => a.id !== id)),
            title: 'Delete Assignment',
            message: `Are you sure you want to delete the assignment "${title}"? This action cannot be undone.`
        });
    };

    const handleStatusChange = (id: string, status: AssignmentStatus) => {
        setAssignments(assignments.map(a => a.id === id ? { ...a, status } : a));
    };

    const sortedAssignments = useMemo(() => {
       return [...assignments].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [assignments]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Assignments</h2>
                <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
                    <PlusIcon /> Add Assignment
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAssignments.map(assignment => {
                    const subject = subjects.find(s => s.id === assignment.subjectId);
                    return <AssignmentCard key={assignment.id} assignment={assignment} subject={subject} onEdit={openEditModal} onDelete={handleDelete} onStatusChange={handleStatusChange} />;
                })}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h3 className="text-lg font-bold mb-4">{editingAssignment ? 'Edit Assignment' : 'Add Assignment'}</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Assignment Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <select value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">Save</button>
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

export default Assignments;