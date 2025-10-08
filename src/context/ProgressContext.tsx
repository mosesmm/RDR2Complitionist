'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ProgressContextType {
  completedTasks: Set<string>;
  goldMedalMissions: Set<string>;
  toggleTask: (taskId: string) => void;
  toggleGoldMedal: (missionId: string) => void;
  isLoaded: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [goldMedalMissions, setGoldMedalMissions] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('rdr2-progress');
      if (savedProgress) {
        setCompletedTasks(new Set(JSON.parse(savedProgress)));
      }
      const savedGoldMedals = localStorage.getItem('rdr2-gold-medals');
      if (savedGoldMedals) {
        setGoldMedalMissions(new Set(JSON.parse(savedGoldMedals)));
      }
    } catch (error) {
      console.error('Failed to load progress from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('rdr2-progress', JSON.stringify(Array.from(completedTasks)));
        localStorage.setItem('rdr2-gold-medals', JSON.stringify(Array.from(goldMedalMissions)));
      } catch (error) {
        console.error('Failed to save progress to localStorage', error);
      }
    }
  }, [completedTasks, goldMedalMissions, isLoaded]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const toggleGoldMedal = (missionId: string) => {
    setGoldMedalMissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(missionId)) {
        newSet.delete(missionId);
      } else {
        newSet.add(missionId);
      }
      return newSet;
    });
  }

  return (
    <ProgressContext.Provider value={{ completedTasks, goldMedalMissions, toggleTask, toggleGoldMedal, isLoaded }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
