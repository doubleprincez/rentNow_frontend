'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';

interface AlertProps {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
    duration?: number; 
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose, duration = 3000 }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const alertClasses: Record<string, string> = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-400 text-white',
        warning: 'bg-white text-black',
        info: 'bg-gray-500 text-white',
    };

    return (
        <motion.div
            initial={{ x: 0, y: -10 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className={`fixed w-full z-[99] top-0 right-0 p-4 flex justify-between items-center rounded-md shadow-md ${alertClasses[type]}`}
        >
            <p className="font-medium text-[15px] barlow">
                {message}
            </p>
            <button onClick={onClose} className="px-3">
                <CircleX className="text-white w-8 h-8" />
            </button>
        </motion.div>
    );
};

export default Alert;
