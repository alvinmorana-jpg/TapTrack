        const USER_DATABASE = {
            "student1": { password: "123", role: "student", name: "Alex Smith", studentId: "11-00001", department: "Engineering" },
            "student2": { password: "123", role: "student", name: "Jamie Lee", studentId: "11-00002", department: "Engineering" },
            "student3": { password: "123", role: "student", name: "Taylor Brown", studentId: "11-00003", department: "Engineering" },
            "student4": { password: "123", role: "student", name: "Jordan Kim", studentId: "11-00004", department: "Engineering" },
            "student5": { password: "123", role: "student", name: "Morgan Davis", studentId: "11-00005", department: "Engineering" },
            "student6": { password: "321", role: "student", name: "Sam Rivera", studentId: "11-00006", department: "STED" },
            "student7": { password: "321", role: "student", name: "Pat Santos", studentId: "11-00007", department: "STED" },
            "student8": { password: "321", role: "student", name: "Casey Flores", studentId: "11-00008", department: "STED" },
            "student9": { password: "321", role: "student", name: "Alex Reyes", studentId: "11-00009", department: "STED" },
            "student10": { password: "321", role: "student", name: "Jamie Cruz", studentId: "11-00010", department: "STED" },
            "student11": { password: "654", role: "student", name: "Ari Gomez", studentId: "11-00011", department: "General Education" },
            "student12": { password: "654", role: "student", name: "Bri Santos", studentId: "11-00012", department: "General Education" },
            "student13": { password: "654", role: "student", name: "Chris Lim", studentId: "11-00013", department: "General Education" },
            "student14": { password: "654", role: "student", name: "Dana Cruz", studentId: "11-00014", department: "General Education" },
            "student15": { password: "654", role: "student", name: "Evan Park", studentId: "11-00015", department: "General Education" },
            "student16": { password: "456", role: "student", name: "Finn Reyes", studentId: "11-00016", department: "Information Technology" },
            "student17": { password: "456", role: "student", name: "Gina Dela Cruz", studentId: "11-00017", department: "Information Technology" },
            "student18": { password: "456", role: "student", name: "Hannah Ortiz", studentId: "11-00018", department: "Information Technology" },
            "student19": { password: "456", role: "student", name: "Ian Flores", studentId: "11-00019", department: "Information Technology" },
            "student20": { password: "456", role: "student", name: "Jade Morales", studentId: "11-00020", department: "Information Technology" },
            "teacher1": { password: "123", role: "teacher", name: "Prof. Davis" },
            "teacher2": { password: "123", role: "teacher", name: "Prof. Wilson" },
            "teacher3": { password: "123", role: "teacher", name: "Prof. Garcia" },
            "teacher4": { password: "123", role: "teacher", name: "Prof. Reyes" },
            "teacher5": { password: "123", role: "teacher", name: "Prof. Nguyen" },
            "teacher6": { password: "123", role: "teacher", name: "Prof. Santos" },
            "teacher7": { password: "123", role: "teacher", name: "Prof. Bautista" },
            "teacher8": { password: "123", role: "teacher", name: "Prof. Rivera" },
            "teacher9": { password: "123", role: "teacher", name: "Prof. Tan" },
            "teacher10": { password: "123", role: "teacher", name: "Prof. Mendez" },
            "teacher11": { password: "123", role: "teacher", name: "Prof. Alvarez" },
            "faculty1": { password: "321", role: "faculty", name: "Dean Jones" },
            "admin1": { password: "321", role: "admin", name: "Admin Principal" }
        };

        let announcementsList = [
            "Welcome to the New Academic Year 2026!",
            "Midterm exams start next Monday. Check your schedules."
        ];

        let STUDENT_ATTENDANCE_RECORDS = [
            { className: "Math for Engineer", date: "Monday, Sep 14", status: "present" },
            { className: "Calculus 1", date: "Monday, Sep 14", status: "present" },
            { className: "EDA", date: "Monday, Sep 14", status: "late" },
            { className: "Path-Fit 1", date: "Monday, Sep 14", status: "present" },
            { className: "Logic Design", date: "Tuesday, Sep 15", status: "absent" },
            { className: "Calculus 2", date: "Tuesday, Sep 15", status: "present" },
            { className: "Ethics", date: "Tuesday, Sep 15", status: "present" },
            { className: "MAPEH", date: "Monday, Sep 14", status: "present" },
            { className: "English", date: "Tuesday, Sep 15", status: "present" },
            { className: "Mathematics", date: "Wednesday, Sep 16", status: "present" },
            { className: "Science", date: "Wednesday, Sep 16", status: "present" },
            { className: "Filipino", date: "Thursday, Sep 17", status: "present" },
            { className: "Physics", date: "Thursday, Sep 17", status: "present" },
            { className: "Math in the Modern World", date: "Wednesday, Sep 16", status: "present" },
            { className: "Programming 1", date: "Thursday, Sep 17", status: "late" },
            { className: "Database Systems", date: "Friday, Sep 18", status: "present" },
            { className: "Web Development", date: "Friday, Sep 18", status: "present" },
            { className: "Chemistry", date: "Thursday, Sep 17", status: "absent" }
        ];

        const WEEKLY_CLASS_SCHEDULE = [
            { day: "Monday", className: "Math for Engineer", room: "EAN 101", time: "8:00 AM", endTime: "10:00 AM", teacher: "teacher1" },
            { day: "Monday", className: "Calculus 1", room: "EAN 102", time: "10:00 AM", endTime: "12:00 PM", teacher: "teacher2" },
            { day: "Monday", className: "Logic Design", room: "EAN 103", time: "1:00 PM", endTime: "3:00 PM", teacher: "teacher3" },
            { day: "Monday", className: "MAPEH", room: "STED 104", time: "8:30 AM", endTime: "10:00 AM", teacher: "teacher4" },
            { day: "Monday", className: "Mathematics", room: "STED 105", time: "10:30 AM", endTime: "12:00 PM", teacher: "teacher4" },
            { day: "Monday", className: "Filipino", room: "STED 106", time: "1:30 PM", endTime: "3:00 PM", teacher: "teacher4" },
            { day: "Monday", className: "Math in the Modern World", room: "GE 107", time: "8:00 AM", endTime: "10:00 AM", teacher: "teacher5" },
            { day: "Monday", className: "Ethics", room: "GE 108", time: "10:00 AM", endTime: "12:00 PM", teacher: "teacher5" },
            { day: "Monday", className: "Path-Fit 1", room: "GE 109", time: "3:00 PM", endTime: "6:00 PM", teacher: "teacher6" },
            { day: "Monday", className: "Programming 1", room: "IT 110", time: "8:30 AM", endTime: "10:30 AM", teacher: "teacher7" },
            { day: "Monday", className: "Web Development", room: "IT 111", time: "10:30 AM", endTime: "12:30 PM", teacher: "teacher7" },
            { day: "Monday", className: "Database Systems", room: "IT 112", time: "1:30 PM", endTime: "3:30 PM", teacher: "teacher8" },
            { day: "Tuesday", className: "Calculus 2", room: "EAN 103", time: "8:00 AM", endTime: "10:00 AM", teacher: "teacher2" },
            { day: "Tuesday", className: "Physics", room: "EAN 101", time: "10:00 AM", endTime: "12:00 PM", teacher: "teacher1" },
            { day: "Tuesday", className: "EDA", room: "EAN 102", time: "1:00 PM", endTime: "3:00 PM", teacher: "teacher3" },
            { day: "Tuesday", className: "English", room: "STED 104", time: "8:30 AM", endTime: "10:00 AM", teacher: "teacher4" },
            { day: "Tuesday", className: "Science", room: "STED 106", time: "10:30 AM", endTime: "12:00 PM", teacher: "teacher4" },
            { day: "Tuesday", className: "Rizal", room: "GE 107", time: "8:00 AM", endTime: "10:00 AM", teacher: "teacher6" },
            { day: "Tuesday", className: "Physical Education", room: "GE 109", time: "10:00 AM", endTime: "12:00 PM", teacher: "teacher6" },
            { day: "Tuesday", className: "Chemistry", room: "IT 111", time: "8:30 AM", endTime: "10:30 AM", teacher: "teacher8" },
            { day: "Tuesday", className: "Techno", room: "IT 112", time: "1:30 PM", endTime: "3:30 PM", teacher: "teacher8" },
            { day: "Wednesday", className: "Math for Engineer", room: "EAN 101", time: "8:00 AM", endTime: "10:00 AM", teacher: "teacher1" },
            { day: "Wednesday", className: "Calculus 1", room: "EAN 102", time: "10:00 AM", endTime: "12:00 PM", teacher: "teacher2" },
            { day: "Wednesday", className: "English", room: "STED 105", time: "8:30 AM", endTime: "10:00 AM", teacher: "teacher4" },
            { day: "Wednesday", className: "Science", room: "STED 104", time: "10:30 AM", endTime: "12:00 PM", teacher: "teacher4" },
            { day: "Wednesday", className: "Math in the Modern World", room: "GE 108", time: "8:00 AM", endTime: "10:00 AM", teacher: "teacher5" },
            { day: "Wednesday", className: "Path-Fit 1", room: "GE 109", time: "3:00 PM", endTime: "6:00 PM", teacher: "teacher6" },
            { day: "Wednesday", className: "Programming 1", room: "IT 110", time: "8:30 AM", endTime: "10:30 AM", teacher: "teacher7" },
            { day: "Wednesday", className: "Database Systems", room: "IT 111", time: "10:30 AM", endTime: "12:30 PM", teacher: "teacher8" },
            { day: "Thursday", className: "Logic Design", room: "EAN 103", time: "8:00 AM", endTime: "10:00 AM", teacher: "teacher3" },
            { day: "Thursday", className: "Physics", room: "EAN 101", time: "10:00 AM", endTime: "12:00 PM", teacher: "teacher1" },
            { day: "Thursday", className: "MAPEH", room: "STED 104", time: "8:30 AM", endTime: "10:00 AM", teacher: "teacher4" },
            { day: "Thursday", className: "Filipino", room: "STED 106", time: "1:30 PM", endTime: "3:00 PM", teacher: "teacher4" },
            { day: "Thursday", className: "Ethics", room: "GE 107", time: "8:00 AM", endTime: "10:00 AM", teacher: "teacher5" },
            { day: "Thursday", className: "Web Development", room: "IT 110", time: "10:30 AM", endTime: "12:30 PM", teacher: "teacher7" },
            { day: "Thursday", className: "Chemistry", room: "IT 112", time: "1:30 PM", endTime: "3:30 PM", teacher: "teacher8" },
            { day: "Friday", className: "Calculus 2", room: "EAN 102", time: "8:00 AM", endTime: "10:00 AM", teacher: "teacher2" },
            { day: "Friday", className: "Math for Engineer", room: "EAN 101", time: "10:00 AM", endTime: "12:00 PM", teacher: "teacher1" },
            { day: "Friday", className: "Mathematics", room: "STED 105", time: "8:30 AM", endTime: "10:00 AM", teacher: "teacher4" },
            { day: "Friday", className: "Science", room: "STED 106", time: "10:30 AM", endTime: "12:00 PM", teacher: "teacher4" },
            { day: "Friday", className: "Rizal", room: "GE 108", time: "8:00 AM", endTime: "10:00 AM", teacher: "teacher6" },
            { day: "Friday", className: "Physical Education", room: "GE 109", time: "3:00 PM", endTime: "6:00 PM", teacher: "teacher6" },
            { day: "Friday", className: "Database Systems", room: "IT 111", time: "8:30 AM", endTime: "10:30 AM", teacher: "teacher8" },
            { day: "Friday", className: "Programming 1", room: "IT 110", time: "10:30 AM", endTime: "12:30 PM", teacher: "teacher7" }
        ];

        const TEACHER_SUBJECTS = {
            teacher1: ["Math for Engineer", "Physics"],
            teacher2: ["Calculus 1", "Calculus 2"],
            teacher3: ["EDA", "Logic Design"],
            teacher4: ["MAPEH", "English", "Mathematics", "Science", "Filipino"],
            teacher5: ["Math in the Modern World", "Ethics"],
            teacher6: ["Path-Fit 1", "Rizal", "Physical Education"],
            teacher7: ["Programming 1", "Web Development"],
            teacher8: ["Database Systems", "Techno", "Chemistry"],
            teacher9: ["Math in the Modern World", "Ethics", "Rizal", "Physical Education", "Path-Fit 1"],
            teacher10: ["Programming 1", "Web Development", "Database Systems", "Techno", "Chemistry"],
            teacher11: ["Programming 1", "Web Development", "Database Systems", "Techno", "Chemistry"]
        };

        const TEACHER_DEPARTMENTS = {
            teacher1: "Engineering", teacher2: "Engineering", teacher3: "Engineering",
            teacher4: "STED", teacher5: "General Education", teacher6: "General Education",
            teacher7: "Information Technology", teacher8: "Information Technology",
            teacher9: "General Education", teacher10: "Information Technology", teacher11: "Information Technology"
        };

        const STUDENT_DEPARTMENT_SUBJECTS = {
            Engineering: ["Math for Engineer", "Calculus 1", "Calculus 2", "Logic Design", "EDA", "Physics"],
            STED: ["MAPEH", "English", "Mathematics", "Science", "Filipino"],
            "General Education": ["Math in the Modern World", "Ethics", "Rizal", "Physical Education", "Path-Fit 1"],
            "Information Technology": ["Programming 1", "Database Systems", "Web Development", "Techno", "Chemistry"]
        };
        const COMMON_STUDENT_SUBJECTS = ["Path-Fit 1"];

        function uniqueSubjectSchedule(schedule) {
            return schedule.filter((item, index, items) =>
                items.findIndex(candidate => candidate.className === item.className) === index
            );
        }

        const ASSIGNED_SCHEDULES = {
            teacher1: uniqueSubjectSchedule(WEEKLY_CLASS_SCHEDULE.filter(item => TEACHER_SUBJECTS.teacher1.includes(item.className))),
            teacher2: uniqueSubjectSchedule(WEEKLY_CLASS_SCHEDULE.filter(item => TEACHER_SUBJECTS.teacher2.includes(item.className))),
            teacher3: uniqueSubjectSchedule(WEEKLY_CLASS_SCHEDULE.filter(item => TEACHER_SUBJECTS.teacher3.includes(item.className))),
            teacher4: uniqueSubjectSchedule(WEEKLY_CLASS_SCHEDULE.filter(item => TEACHER_SUBJECTS.teacher4.includes(item.className))),
            teacher5: uniqueSubjectSchedule(WEEKLY_CLASS_SCHEDULE.filter(item => TEACHER_SUBJECTS.teacher5.includes(item.className))),
            teacher6: uniqueSubjectSchedule(WEEKLY_CLASS_SCHEDULE.filter(item => TEACHER_SUBJECTS.teacher6.includes(item.className))),
            teacher7: uniqueSubjectSchedule(WEEKLY_CLASS_SCHEDULE.filter(item => TEACHER_SUBJECTS.teacher7.includes(item.className))),
            teacher8: uniqueSubjectSchedule(WEEKLY_CLASS_SCHEDULE.filter(item => TEACHER_SUBJECTS.teacher8.includes(item.className))),
            teacher9: uniqueSubjectSchedule(WEEKLY_CLASS_SCHEDULE.filter(item => TEACHER_SUBJECTS.teacher9.includes(item.className))),
            teacher10: uniqueSubjectSchedule(WEEKLY_CLASS_SCHEDULE.filter(item => TEACHER_SUBJECTS.teacher10.includes(item.className))),
            teacher11: uniqueSubjectSchedule(WEEKLY_CLASS_SCHEDULE.filter(item => TEACHER_SUBJECTS.teacher11.includes(item.className))),
            faculty1: WEEKLY_CLASS_SCHEDULE
        };

        const SEAT_ROSTER = [
            "Alex Smith", "Jamie Lee", "Taylor Brown", "Jordan Kim", "Morgan Davis",
            "Sam Rivera", "Pat Santos", "Casey Flores", "Alex Reyes", "Jamie Cruz",
            "Casey Rivera", "Riley Chen", "Avery Thompson", "Parker Wilson", "Quinn Baker",
            "Cameron Reed", "Skyler Adams", "Drew Cooper", "Emerson Hall", "Finley Clark",
            "Harper Lewis", "Logan Young", "Sage Walker", "Rowan King", "Elliot Wright",
            "Reese Scott", "Dakota Green", "Blair Hill", "Kendall Moore", "Peyton Bell"
        ];

        const CLASS_ENROLLMENT_COUNTS = {
            "Math for Engineer": 10, "Calculus 1": 12, "EDA": 8, "Path-Fit 1": 15,
            "Logic Design": 10, "Calculus 2": 10, "Math in the Modern World": 15,
            "Ethics": 12, "Techno": 10, "Chemistry": 9, "Programming 1": 10,
            "Physics": 11, "Filipino": 12, "Database Systems": 10, "Web Development": 9,
            "Rizal": 14, "Physical Education": 15, "MAPEH": 12, "English": 13,
            "Mathematics": 10, "Science": 11
        };

        const ROOM_ASSIGNMENTS = {
            "Math for Engineer": "EAN 101", "Calculus 1": "EAN 102", "EDA": "EAN 102",
            "Path-Fit 1": "GE 109", "Logic Design": "EAN 103", "Calculus 2": "EAN 103",
            "Math in the Modern World": "GE 107", "Ethics": "GE 108", "Techno": "IT 112",
            "Chemistry": "IT 111", "Programming 1": "IT 110", "Physics": "EAN 101",
            "Filipino": "STED 106", "Database Systems": "IT 112", "Web Development": "IT 110",
            "Rizal": "GE 107", "Physical Education": "GE 109", "MAPEH": "STED 104",
            "English": "STED 105", "Mathematics": "STED 105", "Science": "STED 106"
        };

        const CLASS_WORK_TYPES = {
            "Math for Engineer": "Lecture", "Calculus 1": "Lecture", "EDA": "Laboratory",
            "Path-Fit 1": "Laboratory", "Logic Design": "Laboratory", "Calculus 2": "Lecture",
            "Math in the Modern World": "Lecture", "Ethics": "Lecture", "Techno": "Laboratory",
            "Chemistry": "Laboratory", "Programming 1": "Laboratory", "Physics": "Laboratory",
            "Filipino": "Lecture", "Database Systems": "Laboratory", "Web Development": "Laboratory",
            "Rizal": "Lecture", "Physical Education": "Laboratory",
            "MAPEH": "Lecture", "English": "Lecture", "Mathematics": "Lecture", "Science": "Laboratory"
        };

        const CLASS_DEPARTMENTS = {
            "Math for Engineer": "Engineering", "Calculus 1": "Engineering", "EDA": "Engineering",
            "Path-Fit 1": "General Education", "Logic Design": "Engineering", "Calculus 2": "Engineering",
            "Math in the Modern World": "General Education", "Ethics": "General Education",
            "Techno": "Information Technology", "Chemistry": "Information Technology",
            "Programming 1": "Information Technology", "Physics": "Engineering",
            "Filipino": "STED", "Database Systems": "Information Technology",
            "Web Development": "Information Technology", "Rizal": "General Education",
            "Physical Education": "General Education", "MAPEH": "STED", "English": "STED",
            "Mathematics": "STED", "Science": "STED"
        };

        const ROOM_DEPARTMENTS = {
            "EAN 101": "Engineering", "EAN 102": "Engineering", "EAN 103": "Engineering",
            "STED 104": "STED", "STED 105": "STED", "STED 106": "STED",
            "GE 107": "General Education", "GE 108": "General Education", "GE 109": "General Education",
            "IT 110": "Information Technology", "IT 111": "Information Technology", "IT 112": "Information Technology",
            "EAN 113": "Engineering", "STED 114": "STED", "GE 115": "General Education",
            "IT 116": "Information Technology", "EAN 117": "Engineering", "STED 118": "STED",
            "GE 119": "General Education", "IT 120": "Information Technology",
            "EAN 121": "Engineering", "STED 122": "STED", "GE 123": "General Education",
            "IT 124": "Information Technology", "EAN 125": "Engineering"
        };
        const FACULTY_ROOMS = [
            "EAN 101", "EAN 102", "EAN 103",
            "STED 104", "STED 105", "STED 106",
            "GE 107", "GE 108", "GE 109",
            "IT 110", "IT 111", "IT 112",
            "EAN 113", "STED 114", "GE 115",
            "IT 116", "EAN 117", "STED 118", "GE 119", "IT 120",
            "EAN 121", "STED 122", "GE 123", "IT 124", "EAN 125"
        ];
