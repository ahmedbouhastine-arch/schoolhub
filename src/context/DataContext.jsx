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
    { id: 1, name: 'Mrs. Smith', subject: 'Biology', status: 'Absent', adminNote: 'Out for the week.' },
    { id: 2, name: 'Mr. Davis', subject: 'History', status: 'Substitute', adminNote: 'Mr. Clark is subbing today.' },
    { id: 3, name: 'Ms. Johnson', subject: 'Literature', status: 'Present', adminNote: '' }
  ];

  const defaultExams = [
    { id: 1, subject: 'Physics Midterm', date: 'Oct 24, 2026', time: '09:00 AM', location: 'Main Hall', daysLeft: 3 },
    { id: 2, subject: 'Advanced Mathematics', date: 'Oct 28, 2026', time: '10:30 AM', location: 'Room 302', daysLeft: 7 },
  ];

  const defaultLessons = [
    { id: 1, name: 'Mathematics - 10th Grade', link: 'https://drive.google.com/drive/folders/placeholder1', color: '#6366f1' },
    { id: 2, name: 'History Archives', link: 'https://drive.google.com/drive/folders/placeholder2', color: '#f59e0b' },
  ];

  // States
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [teachers, setTeachers] = useState(defaultTeachers);
  const [exams, setExams] = useState(defaultExams);
  const [lessons, setLessons] = useState(defaultLessons);

  // Load from localStorage on mount
  useEffect(() => {
    const s = localStorage.getItem('sh_schedule');
    const t = localStorage.getItem('sh_teachers');
    const e = localStorage.getItem('sh_exams');
    const l = localStorage.getItem('sh_lessons');

    if (s) setSchedule(JSON.parse(s));
    if (t) setTeachers(JSON.parse(t));
    if (e) setExams(JSON.parse(e));
    if (l) setLessons(JSON.parse(l));
  }, []);

  // Save to localStorage when states change
  useEffect(() => { localStorage.setItem('sh_schedule', JSON.stringify(schedule)); }, [schedule]);
  useEffect(() => { localStorage.setItem('sh_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('sh_exams', JSON.stringify(exams)); }, [exams]);
  useEffect(() => { localStorage.setItem('sh_lessons', JSON.stringify(lessons)); }, [lessons]);

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
