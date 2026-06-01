import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [teachers, setTeachers] = useState([
        { id: 1, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@classmind.ai', phone: '+1 234-567-8901', department: 'Computer Science', specialization: 'AI & ML', classes: 8, students: 245, status: 'Active' },
        { id: 2, firstName: 'Michael', lastName: 'Chen', email: 'michael.c@classmind.ai', phone: '+1 234-567-8902', department: 'Computer Science', specialization: 'Deep Learning', classes: 12, students: 389, status: 'Active' },
        { id: 3, firstName: 'Emily', lastName: 'Brown', email: 'emily.b@classmind.ai', phone: '+1 234-567-8903', department: 'Mathematics', specialization: 'Statistics', classes: 6, students: 178, status: 'Active' },
        { id: 4, firstName: 'David', lastName: 'Wilson', email: 'david.w@classmind.ai', phone: '+1 234-567-8904', department: 'Physics', specialization: 'Quantum Mechanics', classes: 10, students: 312, status: 'Active' },
        { id: 5, firstName: 'Jessica', lastName: 'Davis', email: 'jessica.d@classmind.ai', phone: '+1 234-567-8905', department: 'Mathematics', specialization: 'Calculus', classes: 7, students: 201, status: 'Active' },
    ]);

    const [students, setStudents] = useState([
        { id: 1, firstName: 'Jane', lastName: 'Doe', email: 'student@student.edu', studentId: 'STU2024001', program: 'Computer Science', year: 'Year 2', enrollmentDate: '2024-09-01', status: 'Active' },
        { id: 2, firstName: 'John', lastName: 'Smith', email: 'john.s@student.edu', studentId: 'STU2024002', program: 'Engineering', year: 'Year 1', enrollmentDate: '2024-09-01', status: 'Active' },
        { id: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@student.edu', studentId: 'STU2024003', program: 'Mathematics', year: 'Year 3', enrollmentDate: '2023-09-01', status: 'Active' },
        { id: 4, firstName: 'Bob', lastName: 'Brown', email: 'bob.b@student.edu', studentId: 'STU2024004', program: 'Physics', year: 'Year 2', enrollmentDate: '2024-01-15', status: 'Active' },
    ]);

    const [classes, setClasses] = useState([
        { id: 'CS401', name: 'Introduction to Machine Learning', instructor: 'Dr. Sarah Johnson', schedule: 'Mon, Wed 10:00 AM', enrolled: 45, status: 'Active' },
        { id: 'CS502', name: 'Advanced Deep Learning', instructor: 'Prof. Michael Chen', schedule: 'Tue, Thu 2:00 PM', enrolled: 32, status: 'Active' },
        { id: 'MATH101', name: 'Calculus I', instructor: 'Jessica Davis', schedule: 'Mon, Wed, Fri 9:00 AM', enrolled: 60, status: 'Active' },
        { id: 'PHY201', name: 'Quantum Physics', instructor: 'Dr. David Wilson', schedule: 'Tue, Thu 11:00 AM', enrolled: 28, status: 'Active' },
        { id: 'STAT301', name: 'Applied Statistics', instructor: 'Dr. Emily Brown', schedule: 'Mon, Wed 1:00 PM', enrolled: 43, status: 'Active' },
    ]);

    const addTeacher = (teacher) => {
        const newTeacher = { ...teacher, id: teachers.length + 1, classes: 0, students: 0, status: 'Active' };
        setTeachers([...teachers, newTeacher]);
    };

    const addStudent = (student) => {
        const newStudent = { ...student, id: students.length + 1, status: 'Active' };
        setStudents([...students, newStudent]);
    };

    const addClass = (cls) => {
        const newClass = { ...cls, enrolled: 0, status: 'Active' };
        setClasses([...classes, newClass]);
    };

    return (
        <DataContext.Provider value={{
            teachers, addTeacher,
            students, addStudent,
            classes, addClass
        }}>
            {children}
        </DataContext.Provider>
    );
};
