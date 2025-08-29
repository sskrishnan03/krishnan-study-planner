
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Flashcard, FlashcardSet } from '../types';
// fix: Import CollectionIcon to fix 'Cannot find name' error.
import { PlusIcon, TrashIcon, PencilIcon, CollectionIcon } from './icons';
import Modal from './Modal';

interface FlashcardsProps {
    flashcardSets: FlashcardSet[];
    setFlashcardSets: React.Dispatch<React.SetStateAction<FlashcardSet[]>>;
}

const cardVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.8
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        scale: 0.8
    })
};

const FlashcardViewer: React.FC<{ cardSet: FlashcardSet }> = ({ cardSet }) => {
    const [[page, direction], setPage] = useState([0, 0]);
    const [isFlipped, setIsFlipped] = useState(false);
    
    const cardIndex = page % cardSet.cards.length;
    const card = cardSet.cards[cardIndex];

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection]);
        setIsFlipped(false);
    };

    if (!card) {
      return <div className="text-center text-gray-500">This set has no cards.</div>
    }

    return (
        <div className="relative h-64 w-full max-w-md mx-auto flex items-center justify-center">
             <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={page}
                    custom={direction}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = Math.abs(offset.x) * velocity.x;
                        if (swipe < -10000) {
                            paginate(1);
                        } else if (swipe > 10000) {
                            paginate(-1);
                        }
                    }}
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="absolute h-full w-full"
                    style={{ perspective: '1000px' }}
                >
                  <motion.div 
                    className="relative w-full h-full" 
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="absolute w-full h-full bg-white dark:bg-gray-700 rounded-lg shadow-xl flex items-center justify-center p-6 text-center text-xl font-semibold" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                      {card.question}
                    </div>
                     <div className="absolute w-full h-full bg-primary-100 dark:bg-primary-900/50 rounded-lg shadow-xl flex items-center justify-center p-6 text-center text-lg" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                      {card.answer}
                    </div>
                  </motion.div>
                </motion.div>
            </AnimatePresence>
            <button onClick={() => paginate(-1)} className="absolute -left-12 p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 z-10">‹</button>
            <button onClick={() => paginate(1)} className="absolute -right-12 p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 z-10">›</button>
        </div>
    );
};

const Flashcards: React.FC<FlashcardsProps> = ({ flashcardSets, setFlashcardSets }) => {
    const [selectedSetId, setSelectedSetId] = useState<string | null>(flashcardSets[0]?.id || null);
    
    const selectedSet = flashcardSets.find(set => set.id === selectedSetId);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Flashcards</h2>
                <div className="flex items-center gap-4">
                  <select
                      value={selectedSetId || ''}
                      onChange={e => setSelectedSetId(e.target.value)}
                      className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                  >
                      <option value="" disabled>Select a set</option>
                      {flashcardSets.map(set => (
                          <option key={set.id} value={set.id}>{set.title}</option>
                      ))}
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
                    <PlusIcon /> Manage Sets
                  </button>
                </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
                {selectedSet ? <FlashcardViewer cardSet={selectedSet} /> : 
                <div className="text-center h-64 flex flex-col justify-center items-center text-gray-500">
                    <CollectionIcon className="w-12 h-12 mb-4"/>
                    <p>Select a flashcard set to begin studying, or create a new one.</p>
                </div>}
            </div>
        </div>
    );
};

export default Flashcards;
