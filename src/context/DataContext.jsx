import React, { createContext, useContext, useState, useEffect } from 'react';
import * as templates from '../data/templates';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // Remove expired exams (date + time has passed)
  const removeExpiredExams = (examsList) => {
    const now = new Date();
    return examsList.filter(exam => {
      if (!exam.date) return true;
      const [year, month, day] = exam.date.split('-').map(Number);
      const examDate = new Date(year, month - 1, day);

      if (exam.time) {
        const [hours, minutes] = exam.time.split(':').map(Number);
        examDate.setHours(hours, minutes, 0, 0);
      } else {
        examDate.setHours(23, 59, 59, 999);
      }

      return examDate > now;
    });
  };

  // States - Use templates as initial state for local dev visibility
  const [schedule, setSchedule] = useState(templates.defaultSchedule);
  const [teachers, setTeachers] = useState(templates.defaultTeachers);
  const [exams, setExams] = useState(removeExpiredExams(templates.defaultExams));
  const [lessons, setLessons] = useState(templates.defaultLessons);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [dbVerified, setDbVerified] = useState(false); // Track if we've successfully reached the DB

  // Helper to initialize DB with template data (Admin only usually)
  const initializeDatabase = async () => {
    const data = {
      schedule: templates.defaultSchedule,
      teachers: templates.defaultTeachers,
      exams: removeExpiredExams(templates.defaultExams),
      lessons: templates.defaultLessons
    };
    
    try {
      setSchedule(data.schedule);
      setTeachers(data.teachers);
      setExams(data.exams);
      setLessons(data.lessons);
      setDbVerified(true);
      
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return { success: true };
    } catch (err) {
      console.error("Failed to initialize DB", err);
      return { success: false, error: err.message };
    }
  };

  // Fetch from MongoDB via API on mount
  useEffect(() => {
    fetch('/api/sync')
      .then(res => res.json())
      .then(data => {
        // Only populate if data actually exists in DB
        if (data && Object.keys(data).length > 0) {
          if (data.schedule) setSchedule(data.schedule);
          if (data.teachers) setTeachers(data.teachers);
          if (data.exams) {
            const validExams = removeExpiredExams(data.exams);
            setExams(validExams);
          }
          if (data.lessons) setLessons(data.lessons);
          setDbVerified(true); // Confirmed we have a working DB connection with data
        }
        setIsLoaded(true);
      })
      .catch(err => {
        console.error("Failed to fetch from DB (expected in local dev)", err);
        setIsLoaded(true);
        // We do NOT set dbVerified here, so auto-save won't trigger
      });
  }, []);

  // Save to MongoDB when states change by Admin
  useEffect(() => {
    if (!isLoaded || !dbVerified) return; // ONLY save if we have a verified DB connection
    
    const saveToDB = async () => {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule, teachers, exams, lessons })
        });
      } catch (err) {
        console.error("Failed to sync to DB", err);
      }
    };
    
    const timeoutId = setTimeout(() => {
      saveToDB();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [schedule, teachers, exams, lessons, isLoaded, dbVerified]);

  if (!isLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        color: 'var(--text-primary)', 
        background: 'var(--bg-primary)',
        fontFamily: 'Inter' 
      }}>
        Loading Secure Data...
      </div>
    );
  }

  return (
    <DataContext.Provider value={{
      schedule, setSchedule,
      teachers, setTeachers,
      exams, setExams,
      lessons, setLessons,
      initializeDatabase,
      isLoaded
    }}>
      {children}
    </DataContext.Provider>
  );
};
