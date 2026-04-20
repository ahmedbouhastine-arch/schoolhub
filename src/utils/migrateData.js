/**
 * One-time migration to push local default data to MongoDB
 * Run this once, then remove the file
 */

// Default data from DataContext.jsx
const defaultSchedule = [
  { id: 1, time: '08:00 - 09:00', monday: 'History', tuesday: 'Informatique', wednesday: 'Informatique', thursday: 'P.E.', friday: 'Informatique (Week A)', saturday: 'English' },
  { id: 2, time: '09:00 - 10:00', monday: 'Math & Geometrie', tuesday: 'Informatique', wednesday: 'Informatique', thursday: 'P.E.', friday: 'Informatique (Week A)', saturday: 'English' },
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
  { id: 1, subject: 'Cntrl Tech', date: '2026-04-15', time: '10:00', location: 'TBD', linkedLessons: [], linkedMaterials: [] },
  { id: 2, subject: 'Cntrl Eng', date: '2026-04-18', time: '08:00', location: 'TBD', linkedLessons: [], linkedMaterials: [] },
  { id: 3, subject: 'Cntrl His', date: '2026-04-20', time: '08:00', location: 'TBD', linkedLessons: [], linkedMaterials: [] },
  { id: 4, subject: 'Cntrl Geo', date: '2026-04-21', time: '13:00', location: 'TBD', linkedLessons: [], linkedMaterials: [] },
  { id: 5, subject: 'Cntrl phy', date: '2026-04-22', time: '13:00', location: 'TBD', linkedLessons: [], linkedMaterials: [] },
  { id: 6, subject: 'Cntrl Math', date: '2026-04-23', time: '13:00', location: 'TBD', linkedLessons: [], linkedMaterials: [] }
];

const defaultLessons = [
  { id: 1, name: 'Mathematics', link: 'https://drive.google.com/drive/folders/1YMz-LvD1hXYoHEFTroZIjJEyCUdHbYJz?usp=drive_link', color: '#6366f1', parentId: null, subSubjects: [] },
  { id: 2, name: 'Algebra', link: '', color: '#818cf8', parentId: 1, subSubjects: [] },
  { id: 3, name: 'Geometry', link: '', color: '#818cf8', parentId: 1, subSubjects: [] },
  { id: 4, name: 'Physics & Chemistry', link: 'https://drive.google.com/drive/folders/1UZcKaOk6jVePKPxdDQap5qZGDnXwXc6S?usp=drive_link', color: '#f59e0b', parentId: null, subSubjects: [] },
  { id: 5, name: 'History & Geography', link: 'https://drive.google.com/drive/folders/142EGxFtopUL7kjMO58d60b2SjJ03Rf8v?usp=drive_link', color: '#f59e0b', parentId: null, subSubjects: [] },
  { id: 6, name: 'English', link: 'https://drive.google.com/drive/folders/1ZFqDFRRelHPWUXPC0OXqcHR06hG3pWuA?usp=drive_link', color: '#f59e0b', parentId: null, subSubjects: [] },
  { id: 7, name: 'French', link: 'https://drive.google.com/drive/folders/1rN4ZbW_3wUduuVV8nlqkWHwQgzEJ0WvM?usp=drive_link', color: '#f59e0b', parentId: null, subSubjects: [] },
  { id: 8, name: 'Arabic', link: 'https://drive.google.com/drive/folders/169mLnHNDw94YWhib8j3ZHNUaz6smwFgX?usp=drive_link', color: '#f59e0b', parentId: null, subSubjects: [] },
  { id: 9, name: 'Social Studies', link: 'https://drive.google.com/drive/folders/1z13qJF1ujIaZa1Le9sxgjm7lUXaYMJCy?usp=drive_link', color: '#f59e0b', parentId: null, subSubjects: [] },
  { id: 10, name: 'Islamic Studies', link: 'https://drive.google.com/drive/folders/1QxPDSmM-Exn6EuguIbmkkGdRGAYAOtQF?usp=drive_link', color: '#f59e0b', parentId: null, subSubjects: [] },
  { id: 11, name: 'Technique', link: 'https://drive.google.com/drive/folders/114rIqP9QU-3WjkAvdXKA64_Tet-6qted?usp=drive_link', color: '#f59e0b', parentId: null, subSubjects: [] },
  { id: 12, name: 'Informatique', link: 'https://drive.google.com/drive/folders/10Hq34m68fvjZoc4vjJgxMgcXhSIgdjle?usp=drive_link', color: '#f59e0b', parentId: null, subSubjects: [] },
];

// Remove expired exams
function removeExpiredExams(examsList) {
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
}

// Main migration function
export async function migrateData() {
  console.log('Starting data migration...');

  const dataToMigrate = {
    schedule: defaultSchedule,
    teachers: defaultTeachers,
    exams: removeExpiredExams(defaultExams),
    lessons: defaultLessons
  };

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToMigrate)
    });

    if (res.ok) {
      console.log('✅ Migration successful!');
      console.log('Migrated:', {
        schedule: dataToMigrate.schedule.length + ' slots',
        teachers: dataToMigrate.teachers.length + ' teachers',
        exams: dataToMigrate.exams.length + ' active exams',
        lessons: dataToMigrate.lessons.length + ' subjects'
      });
      return true;
    } else {
      const error = await res.text();
      console.error('❌ Migration failed:', error);
      return false;
    }
  } catch (err) {
    console.error('❌ Migration error:', err);
    return false;
  }
}
