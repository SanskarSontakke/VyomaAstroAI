import React, { createContext, useContext, useState, useCallback } from 'react';

const CalculationContext = createContext(null);

export const CalculationProvider = ({ children }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');

  const startCalculation = useCallback((totalTasks = 1) => {
    setIsCalculating(true);
    setProgress(0);
  }, []);

  const updateProgress = useCallback((increment, taskName) => {
    setProgress(prev => Math.min(prev + increment, 100));
    if (taskName) setCurrentTask(taskName);
  }, []);

  const endCalculation = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
       setIsCalculating(false);
       setProgress(0);
       setCurrentTask('');
    }, 400); // Smooth fade out
  }, []);

  return (
    <CalculationContext.Provider value={{ 
      isCalculating, 
      progress, 
      currentTask,
      startCalculation,
      updateProgress,
      endCalculation
    }}>
      {children}
    </CalculationContext.Provider>
  );
};

export const useCalculation = () => {
  const context = useContext(CalculationContext);
  if (!context) throw new Error('useCalculation must be used within a CalculationProvider');
  return context;
};
