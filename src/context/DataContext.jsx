import React, { createContext, useState, useContext, useEffect } from 'react';

export const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    // State
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                console.log("Fetching data from backend...");
                const [classesRes, teachersRes, studentsRes] = await Promise.all([
                    fetch('/api/classes').then(r => {
                        console.log('Classes Response:', r.status);
                        return r.ok ? r.json() : Promise.reject(`Classes fetch failed: ${r.status}`);
                    }),
                    fetch('/api/teachers').then(r => {
                        console.log('Teachers Response:', r.status);
                        return r.ok ? r.json() : Promise.reject(`Teachers fetch failed: ${r.status}`);
                    }),
                    fetch('/api/students').then(r => {
                        console.log('Students Response:', r.status);
                        return r.ok ? r.json() : Promise.reject(`Students fetch failed: ${r.status}`);
                    })
                ]);

                console.log("Data fetched successfully:", { classes: classesRes.length, teachers: teachersRes.length, students: studentsRes.length });
                setClasses(classesRes);
                setTeachers(teachersRes);
                setStudents(studentsRes);
            } catch (error) {
                console.error("Critical Data Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Derived Data for specific views
    const getTeacherData = (email) => {
        const teacher = teachers.find(t => t.email === email);
        if (!teacher) return null;

        const assignedClasses = teacher.assignedClasses || [];
        const teacherCourses = classes.filter(c => assignedClasses.includes(c.id));

        const totalStudents = teacherCourses.reduce((acc, c) => acc + (c.studentsCount || 0), 0);
        const avgEngagement = teacherCourses.length > 0
            ? Math.round(teacherCourses.reduce((acc, c) => acc + (c.analytics?.summary?.engaged || 0), 0) / teacherCourses.length)
            : 0;

        return {
            ...teacher,
            courses: teacherCourses,
            summaryStats: [
                { id: 'classes', label: 'Active Classes', value: teacherCourses.length, icon: 'BookOpen', color: '#3B82F6' },
                { id: 'students', label: 'Total Students', value: totalStudents || 0, icon: 'Users', color: '#A855F7' },
                { id: 'engagement', label: 'Avg. Engagement', value: `${avgEngagement || 0}%`, icon: 'TrendingUp', color: '#6366F1' },
                { id: 'materials', label: 'Materials Uploaded', value: teacher.materialsCount || 0, icon: 'Upload', color: '#EC4899' },
            ]
        };
    };

    const getStudentData = (email) => {
        const student = students.find(s => s.email === email);
        if (!student) return null;

        const enrolledClasses = student.enrolledClasses || [];

        return {
            ...student,
            stats: [
                { label: 'Enrolled Classes', value: enrolledClasses.length.toString() },
                { label: 'Avg. Progress', value: student.progress || '0%' },
                { label: 'Total Materials', value: student.materialsCount || '0' },
                { label: 'New Updates', value: student.updatesCount || '0' }
            ],
            classes: classes.filter(c => enrolledClasses.includes(c.id)).map(c => ({
                ...c,
                instructor: c.instructorId ? `${teachers.find(t => t.id === c.instructorId)?.firstName} ${teachers.find(t => t.id === c.instructorId)?.lastName}` : 'Unassigned',
                progress: student.progress ? parseInt(student.progress) : 0,
                nextSession: c.schedule || 'TBD'
            }))
        };
    };

    const validateUser = async (email, password) => {
        try {
            console.log("Validating user credentials...");
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const user = await res.json();
                console.log("Login successful for:", email);
                return {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: user.role,
                    id: user.id
                };
            } else {
                console.warn("Login failed:", res.status);
            }
        } catch (error) {
            console.error("Auth validation network error", error);
        }
        return null;
    };

    // CRUD Functions (Updated to call API)
    const addTeacher = async (teacher) => {
        try {
            const res = await fetch('/api/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'Active',
                    performance: '94%',
                    office: 'Campus Building 4, Office 201',
                    materialsCount: 0,
                    ...teacher,
                    role: 'teacher',
                    assignedClasses: teacher.assignedClasses || []
                })
            });
            if (res.ok) {
                const newTeacher = await res.json();
                setTeachers(prev => [...prev, newTeacher]);
                return true;
            } else {
                console.error("Failed to add teacher:", await res.text());
                return false;
            }
        } catch (error) {
            console.error("Error adding teacher", error);
            return false;
        }
    };

    const updateTeacher = async (id, updatedData) => {
        const numId = Number(id);
        if (!id || isNaN(numId)) {
            console.error("[UPDATE DEBUG] Invalid ID passed to updateTeacher:", id);
            return false;
        }

        console.log(`[UPDATE DEBUG] Updating teacher ${id} (parsed: ${numId}) with data:`, updatedData);
        try {
            const res = await fetch(`/api/teachers/${numId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            console.log(`[UPDATE DEBUG] Response status: ${res.status}`);

            if (res.ok) {
                const data = await res.json();
                console.log(`[UPDATE DEBUG] Update success, received:`, data);
                // Use strict comparison with Number cast to ensure matches
                setTeachers(prev => prev.map(t => Number(t.id) === numId ? data : t));
                return true;
            } else {
                console.error(`[UPDATE DEBUG] Update failed: ${await res.text()}`);
                return false;
            }
        } catch (error) {
            console.error("[UPDATE DEBUG] Error update teacher", error);
            return false;
        }
    };

    const deleteTeacher = async (id) => {
        const numId = Number(id);
        try {
            const res = await fetch(`/api/teachers/${numId}`, { method: 'DELETE' });
            if (res.ok) {
                setTeachers(prev => prev.filter(t => t.id !== numId));
            }
        } catch (error) {
            console.error("Error delete teacher", error);
        }
    };

    const addStudent = async (student) => {
        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'Active',
                    progress: '0%',
                    materialsCount: 0,
                    updatesCount: 0,
                    ...student,
                    role: 'student',
                    enrolledClasses: student.enrolledClasses || []
                })
            });
            if (res.ok) {
                const newStudent = await res.json();
                setStudents(prev => [...prev, newStudent]);
            } else {
                console.error("Failed to add student:", await res.text());
            }
        } catch (error) {
            console.error("Error adding student", error);
        }
    };

    const updateStudent = async (id, updatedData) => {
        const numId = Number(id);
        console.log(`Updating student ${numId}`, updatedData);
        try {
            const res = await fetch(`/api/students/${numId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (res.ok) {
                const data = await res.json();
                setStudents(prev => prev.map(s => s.id === numId ? data : s));
            } else {
                console.error("Failed to update student:", await res.text());
            }
        } catch (error) {
            console.error("Error updating student", error);
        }
    };

    const deleteStudent = async (id) => {
        const numId = Number(id);
        try {
            const res = await fetch(`/api/students/${numId}`, { method: 'DELETE' });
            if (res.ok) {
                setStudents(prev => prev.filter(s => s.id !== numId));
            }
        } catch (error) {
            console.error("Error deleting student", error);
        }
    };

    const addClass = async (newClass) => {
        try {
            const clsData = {
                ...newClass,
                id: newClass.id || `CS${Math.floor(Math.random() * 900) + 100}`,
                status: 'Active',
                studentsCount: 0, // Align with model
                stats: [{ label: 'Total Students', value: '0' }, { label: 'Avg Attendance', value: '0%' }, { label: 'Engagement', value: '0%' }, { label: 'Pending Reviews', value: '0' }],
                tracking: [],
                analytics: { summary: { engaged: 0, neutral: 0, disengaged: 0, improvement: 0 }, trends: [] },
                recentActivity: []
            };

            const res = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clsData)
            });
            if (res.ok) {
                const savedClass = await res.json();
                setClasses(prev => [...prev, savedClass]);
            } else {
                console.error("Add class failed:", await res.text());
            }
        } catch (error) {
            console.error("Error adding class", error);
        }
    };

    const updateClass = async (id, updatedData) => {
        try {
            const res = await fetch(`/api/classes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (res.ok) {
                setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
            }
        } catch (error) {
            console.error("Error updating class", error);
        }
    };

    const deleteClass = async (id) => {
        try {
            const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setClasses(prev => prev.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Error deleting class", error);
        }
    };

    const assignClassToTeacher = async (teacherId, classId) => {
        const teacher = teachers.find(t => t.id === teacherId);
        const cls = classes.find(c => c.id === classId);

        if (teacher && cls) {
            const newAssignedClasses = Array.from(new Set([...teacher.assignedClasses, classId]));

            // Persist to Teacher and Class in parallel
            try {
                await Promise.all([
                    updateTeacher(teacherId, { assignedClasses: newAssignedClasses }),
                    updateClass(classId, {
                        instructorId: teacherId,
                        instructorName: `${teacher.firstName} ${teacher.lastName}`
                    })
                ]);
            } catch (error) {
                console.error("Failed to persist assignment", error);
            }
        }
    };

    const enrollStudentInClass = async (studentId, classId) => {
        const student = students.find(s => s.id === studentId);
        const cls = classes.find(c => c.id === classId);

        if (student && cls && !(student.enrolledClasses || []).includes(classId)) {
            const newEnrolled = Array.from(new Set([...(student.enrolledClasses || []), classId]));

            // Update Class stats and studentsCount
            const currentCount = parseInt(cls.studentsCount || 0);
            const newStats = (cls.stats || []).map(s =>
                s.label === 'Total Students' ? { ...s, value: (currentCount + 1).toString() } : s
            );

            try {
                await Promise.all([
                    updateStudent(studentId, { enrolledClasses: newEnrolled }),
                    updateClass(classId, {
                        stats: newStats,
                        studentsCount: currentCount + 1
                    })
                ]);
            } catch (error) {
                console.error("Failed to persist enrollment", error);
            }
        }
    };

    const unenrollStudentFromClass = async (studentId, classId) => {
        const student = students.find(s => s.id === studentId);
        const cls = classes.find(c => c.id === classId);

        if (student && cls && (student.enrolledClasses || []).includes(classId)) {
            const newEnrolled = (student.enrolledClasses || []).filter(id => id !== classId);

            // Update Class stats and studentsCount
            const currentCount = parseInt(cls.studentsCount || 0);
            const newCount = Math.max(0, currentCount - 1);
            const newStats = (cls.stats || []).map(s =>
                s.label === 'Total Students' ? { ...s, value: newCount.toString() } : s
            );

            try {
                await Promise.all([
                    updateStudent(studentId, { enrolledClasses: newEnrolled }),
                    updateClass(classId, {
                        stats: newStats,
                        studentsCount: newCount
                    })
                ]);
            } catch (error) {
                console.error("Failed to persist unenrollment", error);
            }
        }
    };

    const bulkAddTeachers = async (teachersData) => {
        try {
            console.log("Starting bulk teacher import for", teachersData.length, "teachers...");
            const res = await fetch('/api/teachers/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teachersData)
            });
            if (res.ok) {
                const results = await res.json();
                console.log('Bulk Import Success:', results);
                // Refresh teachers
                const updatedTeachers = await fetch('/api/teachers').then(r => r.json());
                setTeachers(updatedTeachers);
                return results;
            } else {
                console.error("Bulk add teachers failed:", await res.text());
            }
        } catch (error) {
            console.error("Error in bulkAddTeachers:", error);
        }
        return null;
    };

    const bulkAddStudents = async (studentsData) => {
        try {
            console.log("Starting bulk student import for", studentsData.length, "students...");
            const res = await fetch('/api/students/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentsData)
            });
            if (res.ok) {
                const results = await res.json();
                console.log('Bulk Import Success:', results);
                // Refresh students from backend to ensure data consistency
                const updatedStudents = await fetch('/api/students').then(r => r.json());
                setStudents(updatedStudents);
                return results;
            } else {
                console.error("Bulk add students failed:", await res.text());
            }
        } catch (error) {
            console.error("Error in bulkAddStudents:", error);
        }
        return null;
    };

    return (
        <DataContext.Provider value={{
            teachers, students, classes, loading,
            dashboardStats: {
                totalStudents: students.length,
                totalTeachers: teachers.length,
                totalClasses: classes.length,
                activeTeachers: teachers.filter(t => t.status === 'Active').length,
                activeClasses: classes.filter(c => c.status === 'Active').length
            },
            addTeacher, updateTeacher, deleteTeacher,
            addStudent, updateStudent, deleteStudent,
            addClass, updateClass, deleteClass,
            assignClassToTeacher, enrollStudentInClass, unenrollStudentFromClass,
            bulkAddStudents, bulkAddTeachers,
            validateUser, getTeacherData, getStudentData
        }}>
            {children}
        </DataContext.Provider>
    );
};
