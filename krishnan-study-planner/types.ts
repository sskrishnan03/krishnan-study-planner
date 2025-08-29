
export enum Screen {
    Dashboard = 'Dashboard',
    Subjects = 'Subjects',
    Timetable = 'Timetable',
    Assignments = 'Assignments',
    Flashcards = 'Flashcards',
    Analytics = 'Analytics',
    Pomodoro = 'Pomodoro Timer',
}

export interface Topic {
    id: string;
    name: string;
    completed: boolean;
}

export interface Subject {
    id: string;
    name: string;
    color: string;
    topics: Topic[];
}

export enum AssignmentStatus {
    Pending = 'Pending',
    Completed = 'Completed',
    Overdue = 'Overdue',
}

export interface Assignment {
    id: string;
    title: string;
    subjectId: string;
    dueDate: string;
    status: AssignmentStatus;
}

export interface Flashcard {
    id: string;
    question: string;
    answer: string;
}

export interface FlashcardSet {
    id: string;
    title: string;
    cards: Flashcard[];
}

export interface Task {
    id: string;
    title: string;
    subjectId: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime: string; // e.g., "09:00"
    endTime: string; // e.g., "10:00"
}
