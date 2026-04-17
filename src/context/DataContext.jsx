import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // Default Initial States
  const defaultSchedule = [
    { id: 1, time: '08:00 - 09:00', monday: 'History', tuesday: 'Informatique', wednesday: 'Informatique', thursday: 'P.E.', friday: 'Informatique (Week A)', saturday: 'English' },
    { id: 2, time: '09:00 - 10:00', monday: 'Math & Geometrie', tuesday: 'Informatique', wednesday: 'Informatique', thursday: 'P.E.', friday: 'Informatique (Week A)', saturday: 'Islamic / Social St.' },
    { id: 3, time: '10:00 - 11:00', monday: 'Math & Geometrie', tuesday: 'Physics & Chemistry', wednesday: 'Technique', thursday: 'Arabic', friday: '', saturday: 'French' },
    { id: 4, time: '11:00 - 12:00', monday: '', tuesday: 'Physics & Chemistry', wednesday: 'Technique', thursday: 'Arabic', friday: '', saturday: 'French' },
    { id: 5, time: '12:00 - 13:00', monday: 'Physics & Chemistry (Week A)', tuesday: '', wednesday: '', thursday: '', friday: 'French', saturday: '' },
    { id: 6, time: '13:00 - 14:00', monday: 'English', tuesday: 'Geography', wednesday: 'Physics & Chemistry', thursday: 'Math & Geometrie', friday: '', saturday: '' },
    { id: 7, time: '14:00 - 15:00', monday: 'English', tuesday: '', wednesday: 'Arabic', thursday: 'Math & Geometrie', friday: '', saturday: '' },
    { id: 8, time: '15:00 - 16:00', monday: 'Arabic', tuesday: '', wednesday: 'Islamic Studies', thursday: '', friday: '', saturday: '' },
    { id: 9, time: '16:00 - 17:00', monday: 'Social Studies', tuesday: '', wednesday: 'Math & Geometrie', thursday: 'Physics & Chemistry', friday: '', saturday: '' },
  ];

  const defaultTeachers = [
    { id: 1, name: 'Mr. Baligh', subject: 'Mathmatics', status: 'Present', adminNote: 'Well and healthy' },
    { id: 2, name: 'Ms. his&geo', subject: 'History & Geography', status: 'Present', adminNote: 'Well and healthy' },
    { id: 3, name: 'Ms. social', subject: 'social studies', status: 'Present', adminNote: 'Well and healthy' },
    { id: 4, name: 'Ms. physics', subject: 'Physics & Chemistry', status: 'Present', adminNote: 'Well and healthy' },
    { id: 5, name: 'Ms. Talbi', subject: 'English', status: 'Present', adminNote: 'Well and healthy' },
    { id: 6, name: 'Mr. Manzli', subject: 'French', status: 'Present', adminNote: 'Well and healthy' },
    { id: 7, name: 'Ms. arabic', subject: 'Arabic', status: 'Present', adminNote: 'Well and healthy' },
    { id: 8, name: 'Ms. social', subject: 'Social Studies', status: 'Present', adminNote: 'Well and healthy' },
  ];

  const defaultExams = [
    { id: 1, subject: 'Cntrl Tech', date: '2026-04-15', time: '10:00', location: 'TBD' },
    { id: 2, subject: 'Cntrl Eng', date: '2026-04-18', time: '08:00', location: 'TBD' },
    { id: 3, subject: 'Cntrl His', date: '2026-04-20', time: '08:00', location: 'TBD' },
    { id: 4, subject: 'Cntrl Geo', date: '2026-04-21', time: '13:00', location: 'TBD' },
    { id: 5, subject: 'Cntrl phy', date: '2026-04-22', time: '13:00', location: 'TBD' },
    { id: 6, subject: 'Cntrl Math', date: '2026-04-23', time: '13:00', location: 'TBD' }
  ];

  const defaultLessons = [
    { id: 1, name: 'Mathmatics', link: 'https://drive.google.com/drive/folders/1YMz-LvD1hXYoHEFTroZIjJEyCUdHbYJz?usp=drive_link', color: '#6366f1' },
    { id: 2, name: 'Physics & Chemistry', link: 'https://drive.google.com/drive/folders/1UZcKaOk6jVePKPxdDQap5qZGDnXwXc6S?usp=drive_link', color: '#f59e0b' },
    { id: 3, name: 'History & Geography', link: 'https://drive.google.com/drive/folders/142EGxFtopUL7kjMO58d60b2SjJ03Rf8v?usp=drive_link', color: '#f59e0b' },
    { id: 4, name: 'English', link: 'https://drive.google.com/drive/folders/1ZFqDFRRelHPWUXPC0OXqcHR06hG3pWuA?usp=drive_link', color: '#f59e0b' },
    { id: 5, name: 'French', link: 'https://drive.google.com/drive/folders/1rN4ZbW_3wUduuVV8nlqkWHwQgzEJ0WvM?usp=drive_link', color: '#f59e0b' },
    { id: 6, name: 'Arabic', link: 'https://drive.google.com/drive/folders/169mLnHNDw94YWhib8j3ZHNUaz6smwFgX?usp=drive_link', color: '#f59e0b' },
    { id: 7, name: 'Social Studies', link: 'https://drive.google.com/drive/folders/1z13qJF1ujIaZa1Le9sxgjm7lUXaYMJCy?usp=drive_link', color: '#f59e0b' },
    { id: 8, name: 'Islamic Studies', link: 'https://drive.google.com/drive/folders/1QxPDSmM-Exn6EuguIbmkkGdRGAYAOtQF?usp=drive_link', color: '#f59e0b' },
    { id: 9, name: 'Technique', link: 'https://drive.google.com/drive/folders/114rIqP9QU-3WjkAvdXKA64_Tet-6qted?usp=drive_link', color: '#f59e0b' },
    { id: 10, name: 'Informatique', link: 'https://drive.google.com/drive/folders/10Hq34m68fvjZoc4vjJgxMgcXhSIgdjle?usp=drive_link', color: '#f59e0b' },
  ];

  // States
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [teachers, setTeachers] = useState(defaultTeachers);
  const [exams, setExams] = useState(defaultExams);
  const [lessons, setLessons] = useState(defaultLessons);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch from MongoDB via API on mount
  useEffect(() => {
    fetch('/api/sync')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          if (data.schedule) setSchedule(data.schedule);
          if (data.teachers) setTeachers(data.teachers);
          if (data.exams) setExams(data.exams);
          if (data.lessons) setLessons(data.lessons);
        }
        setIsLoaded(true);
      })
      .catch(err => {
        console.error("Failed to fetch from DB, falling back to defaults", err);
        setIsLoaded(true);
      });
  }, []);

  // Save to MongoDB when states change by Admin
  useEffect(() => {
    if (!isLoaded) return;
    
    // We only perform the POST if we are actively loaded
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
    
    // Simple debounce to prevent API spamming
    const timeoutId = setTimeout(() => {
      saveToDB();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [schedule, teachers, exams, lessons, isLoaded]);

  if (!isLoaded) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-primary)', fontFamily: 'Inter' }}>Loading Database Server...</div>;
  }

  return (
    <DataContext.Provider value={{
      schedule, setSchedule,
      teachers, setTeachers,
      exams, setExams,
      lessons, setLessons
    }}>
      {children}
    </DataContext.Provider>
  );
};
