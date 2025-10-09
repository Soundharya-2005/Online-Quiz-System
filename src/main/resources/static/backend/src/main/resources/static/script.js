let collegeChart;
let departmentChart;
const API_BASE_URL = 'http://localhost:8080/api';
const navButtons = document.querySelectorAll('nav button');
const sections = document.querySelectorAll('.section');        
const addStudentBtn = document.getElementById('addStudentBtn');
const studentNameInput = document.getElementById('studentName');
const studentRollNoInput = document.getElementById('studentRollNo');
const studentDepartmentSelect = document.getElementById('studentDepartment');
const studentAcademicYearSelect = document.getElementById('studentAcademicYear');
const saveStudentBtn = document.getElementById('saveStudentBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const registeredStudentsTableBody = document.getElementById('registeredStudentsTableBody');
const clearAllStudentsBtn = document.getElementById('clearAllStudentsBtn');
const originalRollNoInput = document.getElementById('originalRollNo');
const markDailyAttendanceBtn = document.getElementById('markDailyAttendanceBtn');
const dailyAttendanceDateInput = document.getElementById('dailyAttendanceDate');
const dailyAttendanceDepartmentSelect = document.getElementById('dailyAttendanceDepartment');
const dailyAttendanceAcademicYearSelect = document.getElementById('dailyAttendanceAcademicYear');
const loadDailyStudentsBtn = document.getElementById('loadDailyStudentsBtn');
const dailyAttendanceTableBody = document.getElementById('dailyAttendanceTableBody');
const submitDailyAttendanceBtn = document.getElementById('submitDailyAttendanceBtn');
const dailyAttendanceSummary = document.getElementById('dailyAttendanceSummary');
const dailyLogbookTableBody = document.getElementById('dailyLogbookTableBody');
const periodWiseAttendanceBtn = document.getElementById('periodWiseAttendanceBtn');
const periodAttendanceDateInput = document.getElementById('periodAttendanceDate');
const periodAttendanceDepartmentSelect = document.getElementById('periodAttendanceDepartment');
const periodAttendanceAcademicYearSelect = document.getElementById('periodAttendanceAcademicYear');
const periodTypeSelect = document.getElementById('periodType');
const periodSubjectDropdownGroup = document.getElementById('periodSubjectDropdownGroup');
const periodSubjectSelect = document.getElementById('periodSubject');
const periodLabDropdownGroup = document.getElementById('periodLabDropdownGroup');
const periodLabSelect = document.getElementById('periodLab');
const loadPeriodStudentsBtn = document.getElementById('loadPeriodStudentsBtn');
const periodAttendanceTableBody = document.getElementById('periodAttendanceTableBody');
const submitPeriodAttendanceBtn = document.getElementById('submitPeriodAttendanceBtn');
const periodAttendanceSummary = document.getElementById('periodAttendanceSummary');
const periodLogbookTableBody = document.getElementById('periodLogbookTableBody');
const leaveManagementBtn = document.getElementById('leaveManagementBtn');
const leaveRollNoInput = document.getElementById('leaveRollNo');
const leaveStartDateInput = document.getElementById('leaveStartDate');
const leaveEndDateInput = document.getElementById('leaveEndDate');
const leaveReasonTextarea = document.getElementById('leaveReason');
const applyLeaveBtn = document.getElementById('applyLeaveBtn');
const leaveLogbookTableBody = document.getElementById('leaveLogbookTableBody');
const viewReportsBtn = document.getElementById('viewReportsBtn');
const reportDepartmentSelect = document.getElementById('reportDepartment');
const reportAcademicYearSelect = document.getElementById('reportAcademicYear');
const generateReportBtn = document.getElementById('generateReportBtn');
const overallChartOverlay = document.getElementById('overallChartOverlay');
const departmentChartOverlay = document.getElementById('departmentChartOverlay');
const overallSummary = document.getElementById('overallSummary');
const departmentSummary = document.getElementById('departmentSummary');
function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.add('hidden');});
    document.getElementById(sectionId).classList.remove('hidden');
navButtons.forEach(button => {
        if (button.id.includes(sectionId.replace('Section', 'Btn'))) {
            button.classList.add('active');
        } else {
            button.classList.remove('active'); }});}
async function getStudentNameByRollNo(rollNo) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${rollNo}`);
        if (response.ok) {
            const student = await response.json();
            return student.name; }
    } catch (error) {
        console.error('Error fetching student name:', error); }
    return 'Unknown Student';}
async function getStudentDeptAcademicYearByRollNo(rollNo) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${rollNo}`);
        if (response.ok) {
            const student = await response.json();
            return { department: student.department, academicYear: student.academicYear };}
    } catch (error) {
        console.error('Error fetching student dept/academicYear:', error); }
    return { department: 'N/A', academicYear: 'N/A' };}
function showMessage(element, message, type = 'info') {
    element.textContent = message;
    element.className = `attendance-summary ${type}`; 
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.add('hidden'); }, 5000);}
async function renderStudentsList() {
    registeredStudentsTableBody.innerHTML = '';
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        const students = await response.json();
 if (students.length === 0) {
            registeredStudentsTableBody.innerHTML = '<tr><td colspan="5">No students registered yet.</td></tr>';
            return; }
students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td>${student.department}</td>
                <td>${student.academicYear}</td>
                <td>
                    <button class="btn btn-info btn-sm edit-student" data-rollno="${student.rollNo}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger btn-sm delete-student" data-rollno="${student.rollNo}"><i class="fas fa-trash"></i> Delete</button>
                </td> `;
            registeredStudentsTableBody.appendChild(row); });
        document.querySelectorAll('.edit-student').forEach(button => {
            button.addEventListener('click', (e) => editStudent(e.currentTarget.dataset.rollno));});
        document.querySelectorAll('.delete-student').forEach(button => {
            button.addEventListener('click', (e) => deleteStudent(e.currentTarget.dataset.rollno));});
    } catch (error) {
        console.error('Error fetching students:', error);
        registeredStudentsTableBody.innerHTML = '<tr><td colspan="5">Error loading students.</td></tr>';}}
async function saveStudent() {
    const name = studentNameInput.value.trim();
    const rollNo = studentRollNoInput.value.trim().toUpperCase();
    const department = studentDepartmentSelect.value;   
    const academicYear = studentAcademicYearSelect.value;
    const originalRollNo = originalRollNoInput.value.trim();
if (!name || !rollNo || !department || !academicYear) {
        alert('Please fill in all student details.');
         return;}
const studentData = { name, rollNo, department, academicYear};try {
        let response;
        if (originalRollNo) { 
            response = await fetch(`${API_BASE_URL}/students/${originalRollNo}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)});
            if (response.status === 409) { 
                alert('Roll Number already exists for another student.');
                return;}
        } else { 
            response = await fetch(`${API_BASE_URL}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)});
            if (response.status === 409) { 
                alert('Roll Number already exists.');
                return; } }
if (response.ok || response.status === 201) { 
            alert(originalRollNo ? 'Student updated successfully!' : 'Student added successfully!');
            renderStudentsList();
            cancelEdit(); } else {
            const errorText = await response.text();
            alert(`Failed to save student: ${errorText || response.statusText}`); }
    } catch (error) {
        console.error('Error saving student:', error);
        alert('An error occurred while saving the student.'); }}
async function editStudent(rollNo) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${rollNo}`);
        if (response.ok) {
            const student = await response.json();
            studentNameInput.value = student.name;
            studentRollNoInput.value = student.rollNo;
            studentDepartmentSelect.value = student.department;
            studentAcademicYearSelect.value = student.academicYear;
            originalRollNoInput.value = student.rollNo; // Store original rollNo for update
            saveStudentBtn.textContent = 'Update Student';
            cancelEditBtn.classList.remove('hidden');
        } else if (response.status === 404) {
            alert('Student not found.');
        } else {
            throw new Error(`Failed to fetch student for editing: ${response.statusText}`);}
    } catch (error) {
        console.error('Error editing student:', error);
        alert('An error occurred while loading student data for editing.');}}
function cancelEdit() {
    studentNameInput.value = '';
    studentRollNoInput.value = '';
    studentDepartmentSelect.value = '';
    studentAcademicYearSelect.value = '';
    originalRollNoInput.value = '';
    saveStudentBtn.textContent = 'Save Student';
    cancelEditBtn.classList.add('hidden');}
async function deleteStudent(rollNo) {
    if (confirm(`Are you sure you want to delete student with Roll No: ${rollNo}? This will also delete all associated attendance and leave records.`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/students/${rollNo}`, {
                method: 'DELETE' });
 if (response.ok) {
                alert('Student and associated records deleted.');
                renderStudentsList();
                renderDailyLogbook();
                renderPeriodLogbook();
                renderLeaveLogbook();
            } else if (response.status === 404) {
                alert('Student not found.');
            } else {
                const errorText = await response.text();
                alert(`Failed to delete student: ${errorText || response.statusText}`);}
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('An error occurred while deleting the student.');}}}
async function clearAllStudents() {
    if (confirm('Are you sure you want to clear ALL registered students and ALL attendance/leave records? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/students/all`, {
                method: 'DELETE'});
if (response.ok) {
                alert('All student and attendance data cleared.');
                renderStudentsList();
                dailyLogbookTableBody.innerHTML = '';
                periodLogbookTableBody.innerHTML = '';
                leaveLogbookTableBody.innerHTML = '';
            } else {
                const errorText = await response.text();
                alert(`Failed to clear all data: ${errorText || response.statusText}`);}
        } catch (error) {
            console.error('Error clearing all data:', error);
            alert('An error occurred while clearing all data.');}}}
async function loadDailyStudents() {
    const date = dailyAttendanceDateInput.value;
    const department = dailyAttendanceDepartmentSelect.value;
    const academicYear= dailyAttendanceAcademicYearSelect.value;
if (!date || !department || !academicYear) {
        alert('Please select Date, Department, and academicYear to load students.');
        return;}
dailyAttendanceTableBody.innerHTML = ''; 
    submitDailyAttendanceBtn.classList.add('hidden');try {
        const studentResponse = await fetch(`${API_BASE_URL}/students`);
        const allStudents = await studentResponse.json();
        const filteredStudents = allStudents.filter(s => s.department === department && s.academicYear === academicYear);
if (filteredStudents.length === 0) {
            dailyAttendanceTableBody.innerHTML = '<tr><td colspan="5">No students found for this Department and academicYear.</td></tr>';
            return;}
const dailyAttendanceResponse = await fetch(`${API_BASE_URL}/daily-attendance`);
const allDailyRecords = await dailyAttendanceResponse.json();
submitDailyAttendanceBtn.classList.remove('hidden');
filteredStudents.forEach(student => {
            const row = document.createElement('tr');
            const existingRecord = allDailyRecords.find(rec =>
                rec.date === date && rec.rollNo === student.rollNo );
const isPresentChecked = existingRecord && existingRecord.status === 'Present' ? 'checked' : '';
const isAbsentChecked = existingRecord && existingRecord.status === 'Absent' ? 'checked' : '';
row.innerHTML = `<td>${date}</td>
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td><input type="radio" name="status-${student.rollNo}" value="Present" ${isPresentChecked}></td>
                <td><input type="radio" name="status-${student.rollNo}" value="Absent" ${isAbsentChecked}></td>`;
            dailyAttendanceTableBody.appendChild(row);});
    } catch (error) {
        console.error('Error loading daily students:', error);
        dailyAttendanceTableBody.innerHTML = '<tr><td colspan="5">Error loading students for attendance.</td></tr>';}}
async function submitDailyAttendance() {
    const date = dailyAttendanceDateInput.value;
    const department = dailyAttendanceDepartmentSelect.value;
    const academicYear = dailyAttendanceAcademicYearSelect.value;
if (!date || !department || !academicYear) {
        alert('Please select Date, Department, and academicYearbefore submitting attendance.');
        return;}
const rows = dailyAttendanceTableBody.querySelectorAll('tr');
    if (rows.length === 0 || rows[0].querySelector('td').colSpan === 5) {
        alert('No students loaded to mark attendance for.');
        return;}
const attendanceRecordsToSubmit = [];
    let markedCount = 0;
for (const row of rows) {
        const rollNo = row.children[1].textContent;
        const studentName = row.children[2].textContent;
        const presentRadio = row.querySelector(`input[name="status-${rollNo}"][value="Present"]`);
        const absentRadio = row.querySelector(`input[name="status-${rollNo}"][value="Absent"]`);
        let status = 'Not Marked';
        if (presentRadio && presentRadio.checked) {
            status = 'Present';
        } else if (absentRadio && absentRadio.checked) {
            status = 'Absent';}
if (status !== 'Not Marked') {
            attendanceRecordsToSubmit.push({
                date: date,
                rollNo: rollNo,
                name: studentName, 
                department: department, 
                academicYear: academicYear,
                status: status});
            markedCount++; }}
 if (attendanceRecordsToSubmit.length === 0) {
        showMessage(dailyAttendanceSummary, 'No attendance changes were marked.', 'info');
        return;} try {
        const response = await fetch(`${API_BASE_URL}/daily-attendance/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attendanceRecordsToSubmit) });
if (response.ok || response.status === 201) {
            showMessage(dailyAttendanceSummary, `Attendance submitted for ${markedCount} students on ${date}.`, 'success');
            renderDailyLogbook();
        } else {
            const errorText = await response.text();
            showMessage(dailyAttendanceSummary, `Failed to submit attendance: ${errorText || response.statusText}`, 'error');}
    } catch (error) {
        console.error('Error submitting daily attendance:', error);
        showMessage(dailyAttendanceSummary, 'An error occurred while submitting attendance.', 'error');}}
async function renderDailyLogbook() {
    dailyLogbookTableBody.innerHTML = '';
    try {
        const response = await fetch(`${API_BASE_URL}/daily-attendance`);
        const dailyAttendanceRecords = await response.json();
        const sortedRecords = [...dailyAttendanceRecords].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;
            return a.rollNo.localeCompare(b.rollNo);});
if (sortedRecords.length === 0) {
            dailyLogbookTableBody.innerHTML = '<tr><td colspan="7">No daily attendance records.</td></tr>';
            return;}
sortedRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${record.date}</td>
                <td>${record.rollNo}</td>
                <td>${record.name}</td>
                <td>${record.department}</td>
                <td>${record.academicYear}</td>
                <td class="${record.status.toLowerCase()}">${record.status}</td>
                <td><button class="btn btn-danger btn-sm delete-daily-record" data-date="${record.date}" data-rollno="${record.rollNo}"><i class="fas fa-trash"></i> Delete</button></td>`;
            dailyLogbookTableBody.appendChild(row); });
document.querySelectorAll('.delete-daily-record').forEach(button => {
            button.addEventListener('click', (e) => {
                const date = e.currentTarget.dataset.date;
                const rollNo = e.currentTarget.dataset.rollno;
                deleteDailyAttendanceRecord(date, rollNo);}); });
    } catch (error) {
        console.error('Error fetching daily attendance logbook:', error);
        dailyLogbookTableBody.innerHTML = '<tr><td colspan="7">Error loading daily attendance logbook.</td></tr>';}}

async function deleteDailyAttendanceRecord(date, rollNo) {
    if (confirm(`Are you sure you want to delete daily attendance for Roll No: ${rollNo} on ${date}?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/daily-attendance?date=${date}&rollNo=${rollNo}`, {
                method: 'DELETE' });
if (response.ok) {
                alert('Daily attendance record deleted.');
                renderDailyLogbook();
            } else if (response.status === 404) {
                alert('Record not found.');
            } else {
                const errorText = await response.text();
                alert(`Failed to delete record: ${errorText || response.statusText}`);}
        } catch (error) {
            console.error('Error deleting daily attendance record:', error);
            alert('An error occurred while deleting the record.');}}}
const subjects = {
    'CSE': ['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Web Tech'],
    'ECE': ['Digital Signal Processing', 'Analog Electronics', 'Microcontrollers', 'Communication Systems'],
    'MECH': ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing Processes'],
    'CIVIL': ['Structural Analysis', 'Geotechnical Engg', 'Transportation Engg', 'Environmental Engg'],
    'EEE': ['Power Systems', 'Control Systems', 'Electrical Machines', 'Digital Electronics']};
const labs = {
    'CSE': ['DS Lab', 'Algorithms Lab', 'Web Tech Lab'],
    'ECE': ['DSP Lab', 'Analog Electronics Lab', 'Microcontroller Lab'],
    'MECH': ['Fluid Mech Lab', 'Thermodynamics Lab', 'CAD/CAM Lab'],
    'CIVIL': ['Surveying Lab', 'Concrete Lab', 'Environmental Lab'],
    'EEE': ['Machines Lab', 'Power Electronics Lab', 'Control Systems Lab']};
function populatePeriodDropdowns() {
    const department = periodAttendanceDepartmentSelect.value;
    const type = periodTypeSelect.value;
    periodSubjectSelect.innerHTML = '<option value="">Select Subject</option>';
    periodLabSelect.innerHTML = '<option value="">Select Lab</option>';
    periodSubjectDropdownGroup.style.display = 'none';
    periodLabDropdownGroup.style.display = 'none';
    if (department && type) {
        if (type === 'subject' && subjects[department]) {
            subjects[department].forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                periodSubjectSelect.appendChild(option);});
            periodSubjectDropdownGroup.style.display = 'block';
        } else if (type === 'lab' && labs[department]) {
            labs[department].forEach(lab => {
                const option = document.createElement('option');
                option.value = lab;
                option.textContent = lab;
                periodLabSelect.appendChild(option);});
            periodLabDropdownGroup.style.display = 'block';} }}
async function loadPeriodStudents() {
    const date = periodAttendanceDateInput.value;
    const department = periodAttendanceDepartmentSelect.value;
    const academicYear = periodAttendanceAcademicYearSelect.value;
    const type = periodTypeSelect.value;
    const periodName = (type === 'subject' ? periodSubjectSelect.value : periodLabSelect.value); // Use periodName
if (!date || !department || !academicYear || !type || !periodName) {
        alert('Please select Date, Department, academicYear, Type, and Name (Subject/Lab) to load students.');
        return;}
    periodAttendanceTableBody.innerHTML = '';
    submitPeriodAttendanceBtn.classList.add('hidden');try {
        const studentResponse = await fetch(`${API_BASE_URL}/students`);
        const allStudents = await studentResponse.json();
        const filteredStudents = allStudents.filter(s => s.department === department && s.academicYear=== academicYear);
 if (filteredStudents.length === 0) {
            periodAttendanceTableBody.innerHTML = '<tr><td colspan="4">No students found for this Department and academicYear.</td></tr>';
            return;}
        const periodAttendanceResponse = await fetch(`${API_BASE_URL}/period-attendance`);
        const allPeriodRecords = await periodAttendanceResponse.json();
        submitPeriodAttendanceBtn.classList.remove('hidden');
        filteredStudents.forEach(student => {
            const row = document.createElement('tr');
            const existingRecord = allPeriodRecords.find(rec =>
                rec.date === date && rec.rollNo === student.rollNo && rec.type === type && rec.periodName === periodName);
            const isPresentChecked = existingRecord && existingRecord.status === 'Present' ? 'checked' : '';
            const isAbsentChecked = existingRecord && existingRecord.status === 'Absent' ? 'checked' : '';
 row.innerHTML = `<td>${date}</td>
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td>
                    <input type="radio" name="periodStatus-${student.rollNo}" value="Present" ${isPresentChecked}> Present
                    <input type="radio" name="periodStatus-${student.rollNo}" value="Absent" ${isAbsentChecked}> Absent
                </td>`;
            periodAttendanceTableBody.appendChild(row); });
    } catch (error) {
        console.error('Error loading period students:', error);
        periodAttendanceTableBody.innerHTML = '<tr><td colspan="4">Error loading students for period attendance.</td></tr>'; }}
async function submitPeriodAttendance() {
    const date = periodAttendanceDateInput.value;
    const department = periodAttendanceDepartmentSelect.value;
    const academicYear = periodAttendanceAcademicYearSelect.value;
    const type = periodTypeSelect.value;
    const periodName = (type === 'subject' ? periodSubjectSelect.value : periodLabSelect.value); // Use periodName
    if (!date || !department || !academicYear || !type || !periodName) {
        alert('Please ensure all fields (Date, Department, academicYear, Type, Subject/Lab) are selected before submitting attendance.');
        return;}
const rows = periodAttendanceTableBody.querySelectorAll('tr');
if (rows.length === 0 || rows[0].querySelector('td').colSpan === 4) {
        alert('No students loaded to mark attendance for.');
        return;}
    const attendanceRecordsToSubmit = [];
    let markedCount = 0;
for (const row of rows) {
        const rollNo = row.children[1].textContent;
        const studentName = row.children[2].textContent;
        const presentRadio = row.querySelector(`input[name="periodStatus-${rollNo}"][value="Present"]`);
        const absentRadio = row.querySelector(`input[name="periodStatus-${rollNo}"][value="Absent"]`);
        let status = 'Not Marked';
        if (presentRadio && presentRadio.checked) {
            status = 'Present';
        } else if (absentRadio && absentRadio.checked) {
            status = 'Absent';}
        if (status !== 'Not Marked') {
            attendanceRecordsToSubmit.push({
                date: date,
                rollNo: rollNo,
                name: studentName, 
                department: department,
                academicYear: academicYear, 
                type: type,
                periodName: periodName, 
                status: status});
            markedCount++;} }
if (attendanceRecordsToSubmit.length === 0) {
        showMessage(periodAttendanceSummary, 'No attendance changes were marked.', 'info');
        return;}try {
        const response = await fetch(`${API_BASE_URL}/period-attendance/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attendanceRecordsToSubmit)});
if (response.ok || response.status === 201) {
            showMessage(periodAttendanceSummary, `Period-wise attendance submitted for ${markedCount} students on ${date} for ${periodName}.`, 'success');
            renderPeriodLogbook();
        } else {
            const errorText = await response.text();
            showMessage(periodAttendanceSummary, `Failed to submit period attendance: ${errorText || response.statusText}`, 'error');}
    } catch (error) {
        console.error('Error submitting period attendance:', error);
        showMessage(periodAttendanceSummary, 'An error occurred while submitting period attendance.', 'error');}}
async function renderPeriodLogbook() {
    periodLogbookTableBody.innerHTML = '';try {
        const response = await fetch(`${API_BASE_URL}/period-attendance`);
        const periodAttendanceRecords = await response.json();
        const sortedRecords = [...periodAttendanceRecords].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;
            if (a.type < b.type) return -1;
            if (a.type > b.type) return 1;
            if (a.periodName < b.periodName) return -1;
            if (a.periodName > b.periodName) return 1;
            return a.rollNo.localeCompare(b.rollNo);});
if (sortedRecords.length === 0) {
            periodLogbookTableBody.innerHTML = '<tr><td colspan="9">No period attendance records.</td></tr>';
            return;}
sortedRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = ` <td>${record.date}</td>
                <td>${record.rollNo}</td>
                <td>${record.name}</td>
                <td>${record.department}</td>
                <td>${record.academicYear}</td>
                <td>${record.type}</td>
                <td>${record.periodName}</td>
                <td class="${record.status.toLowerCase()}">${record.status}</td>
                <td><button class="btn btn-danger btn-sm delete-period-record" data-date="${record.date}" data-rollno="${record.rollNo}" data-type="${record.type}" data-name="${record.periodName}"><i class="fas fa-trash"></i> Delete</button></td>`;
            periodLogbookTableBody.appendChild(row);});
document.querySelectorAll('.delete-period-record').forEach(button => {
            button.addEventListener('click', (e) => {
                const date = e.currentTarget.dataset.date;
                const rollNo = e.currentTarget.dataset.rollno;
                const type = e.currentTarget.dataset.type;
                const periodName = e.currentTarget.dataset.name;
                deletePeriodAttendanceRecord(date, rollNo, type, periodName);});});
    } catch (error) {
        console.error('Error fetching period attendance logbook:', error);
        periodLogbookTableBody.innerHTML = '<tr><td colspan="9">Error loading period attendance logbook.</td></tr>';}}
async function deletePeriodAttendanceRecord(date, rollNo, type, periodName) {
    if (confirm(`Are you sure you want to delete period attendance for Roll No: ${rollNo} on ${date} for ${periodName} (${type})?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/period-attendance?date=${date}&rollNo=${rollNo}&type=${type}&periodName=${encodeURIComponent(periodName)}`, {
                method: 'DELETE'});
if (response.ok) {
                alert('Period attendance record deleted.');
                renderPeriodLogbook();
            } else if (response.status === 404) {
                alert('Record not found.');
            } else {
                const errorText = await response.text();
                alert(`Failed to delete record: ${errorText || response.statusText}`);}
        } catch (error) {
            console.error('Error deleting period attendance record:', error);
            alert('An error occurred while deleting the record.');}}}
async function applyLeave() {
    const rollNo = leaveRollNoInput.value.trim().toUpperCase();
    const startDate = leaveStartDateInput.value;
    const endDate = leaveEndDateInput.value;
    const reason = leaveReasonTextarea.value.trim();
if (!rollNo || !startDate || !endDate || !reason) {
        alert('Please fill in all leave details.');
        return;}
let studentName = 'Unknown Student';try {
        const studentResponse = await fetch(`${API_BASE_URL}/students/${rollNo}`);
        if (studentResponse.ok) {
            const student = await studentResponse.json();
            studentName = student.name;
        } else if (studentResponse.status === 404) {
            alert('Student with this Roll Number does not exist.');
            return;
        } else {
            throw new Error(`Failed to fetch student for leave: ${studentResponse.statusText}`);}
    } catch (error) {
        console.error('Error checking student existence for leave:', error);
        alert('An error occurred while validating student existence.');
        return;}
const leaveData = {
        rollNo: rollNo,
        name: studentName,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
        status: 'Approved' };
try {
        const response = await fetch(`${API_BASE_URL}/leaves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leaveData)});
if (response.ok || response.status === 201) {
            alert('Leave application submitted successfully.');
            renderLeaveLogbook();
            leaveRollNoInput.value = '';
            leaveStartDateInput.value = '';
            leaveEndDateInput.value = '';
            leaveReasonTextarea.value = '';
        } else {
            const errorText = await response.text();
            alert(`Failed to submit leave: ${errorText || response.statusText}`);}
    } catch (error) {
        console.error('Error applying leave:', error);
        alert('An error occurred while submitting the leave application.');}}
async function renderLeaveLogbook() {
    leaveLogbookTableBody.innerHTML = '';try {
        const response = await fetch(`${API_BASE_URL}/leaves`);
        const leaveRecords = await response.json();
        const sortedRecords = [...leaveRecords].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Newest first
if (sortedRecords.length === 0) {
            leaveLogbookTableBody.innerHTML = '<tr><td colspan="7">No leave records.</td></tr>';
            return; }
sortedRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${record.rollNo}</td>
                <td>${record.name}</td>
                <td>${record.startDate}</td>
                <td>${record.endDate}</td>
                <td>${record.reason}</td>
                <td>${record.status}</td>
                <td><button class="btn btn-danger btn-sm delete-leave-record" data-rollno="${record.rollNo}" data-startdate="${record.startDate}"><i class="fas fa-trash"></i> Delete</button></td>`;
            leaveLogbookTableBody.appendChild(row);});
document.querySelectorAll('.delete-leave-record').forEach(button => {
            button.addEventListener('click', (e) => {
                const rollNo = e.currentTarget.dataset.rollno;
                const startDate = e.currentTarget.dataset.startdate;
                deleteLeaveRecord(rollNo, startDate);});});
    } catch (error) {
        console.error('Error fetching leave logbook:', error);
        leaveLogbookTableBody.innerHTML = '<tr><td colspan="7">Error loading leave logbook.</td></tr>';}}
async function deleteLeaveRecord(rollNo, startDate) {
    if (confirm(`Are you sure you want to delete leave record for Roll No: ${rollNo} starting ${startDate}?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/leaves?rollNo=${rollNo}&startDate=${startDate}`, {
                method: 'DELETE'});
if (response.ok) {
                alert('Leave record deleted.');
                renderLeaveLogbook();
            } else if (response.status === 404) {
                alert('Record not found.');
            } else {
                const errorText = await response.text();
                alert(`Failed to delete record: ${errorText || response.statusText}`);}
        } catch (error) {
            console.error('Error deleting leave record:', error);
            alert('An error occurred while deleting the record.');}}}
async function calculateOverallAttendance() {
    try {
        const response = await fetch(`${API_BASE_URL}/daily-attendance`);
        const records = await response.json();
        const totalPresent = records.filter(rec => rec.status === 'Present').length;
        const totalAbsent = records.filter(rec => rec.status === 'Absent').length;
        const totalStudentsMarked = totalPresent + totalAbsent;
        return { totalPresent, totalAbsent, totalStudentsMarked };
    } catch (error) {
        console.error('Error calculating overall attendance:', error);
        return { totalPresent: 0, totalAbsent: 0, totalStudentsMarked: 0 };}}
async function calculateDepartmentAttendance(department, academicYear) {
    try {
        const response = await fetch(`${API_BASE_URL}/daily-attendance/filter?department=${department}&academicYear=${academicYear}`);
        const filteredRecords = await response.json();
        const totalPresent = filteredRecords.filter(rec => rec.status === 'Present').length;
        const totalAbsent = filteredRecords.filter(rec => rec.status === 'Absent').length;
        const totalStudentsMarked = totalPresent + totalAbsent;
        return { totalPresent, totalAbsent, totalStudentsMarked };
    } catch (error) {
        console.error('Error calculating department attendance:', error);
        return { totalPresent: 0, totalAbsent: 0, totalStudentsMarked: 0 };}}
let collegeChartCtx; 
let departmentChartCtx;
function renderCollegeChart(data) {
    collegeChartCtx = document.getElementById('collegeChart') ? document.getElementById('collegeChart').getContext('2d') : null;
if (!collegeChartCtx) {
        console.error('College chart canvas context not found or already destroyed.');
        const collegeChartContainer = document.querySelector('#viewReportsSection .chart-wrapper:first-of-type .chart-container');
        if (collegeChartContainer) {
            collegeChartContainer.innerHTML = `<canvas id="collegeChart"></canvas><div class="chart-overlay" id="overallChartOverlay">Click a slice for details</div>`;
            collegeChartCtx = document.getElementById('collegeChart').getContext('2d');
            if (!collegeChartCtx) return;
        } else {
             return;}}
if (data.totalStudentsMarked === 0) {
        if (collegeChartCtx.canvas.parentNode) {
            collegeChartCtx.canvas.parentNode.innerHTML = `<p style="text-align:center; color:#777;">No overall attendance data to display.</p>`;}
        if (collegeChart) collegeChart.destroy();
        overallSummary.textContent = 'No attendance records available for overall college view.';
        return;
    } else {
          const parentContainer = collegeChartCtx.canvas.parentNode;
          if (parentContainer && parentContainer.innerHTML.includes('No overall attendance data')) {
              parentContainer.innerHTML = '<canvas id="collegeChart"></canvas><div class="chart-overlay" id="overallChartOverlay">Click a slice for details</div>';
              collegeChartCtx = document.getElementById('collegeChart').getContext('2d');
              if (!collegeChartCtx) return;}
        if (collegeChartCtx.canvas.parentNode) {
            collegeChartCtx.canvas.parentNode.style.display = 'block';}}
if (collegeChart) {
        collegeChart.destroy();}
collegeChart = new Chart(collegeChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent'],
            datasets: [{
                data: [data.totalPresent, data.totalAbsent],
                backgroundColor: ['#28a745', '#dc3545'], 
                hoverOffset: 4}]},
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',},
                title: {
                    display: true,
                    text: 'Overall College Daily Attendance'},
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = (value / total * 100).toFixed(2);
                            return `${label}: ${value} (${percentage}%)`;}}} },
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const label = collegeChart.data.labels[index];
                    const value = collegeChart.data.datasets[0].data[index];
                    const total = collegeChart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                    const percentage = (value / total * 100).toFixed(2);
                    if (overallChartOverlay) {
                        overallChartOverlay.textContent = `${label}: ${percentage}%`;
                        overallChartOverlay.classList.add('visible');}}}}});
overallSummary.textContent = `Total Present: ${data.totalPresent}, Total Absent: ${data.totalAbsent}`;}
function renderDepartmentChart(data, department, academicYear) {
    departmentChartCtx = document.getElementById('departmentChart') ? document.getElementById('departmentChart').getContext('2d') : null;
if (!departmentChartCtx) {
        console.error('Department chart canvas context not found or already destroyed.');
        const departmentChartContainer = document.querySelector('#viewReportsSection .chart-wrapper:last-of-type .chart-container');
        if (departmentChartContainer) {
            departmentChartContainer.innerHTML = `<canvas id="departmentChart"></canvas><div class="chart-overlay" id="departmentChartOverlay">Click a slice for details</div>`;
            departmentChartCtx = document.getElementById('departmentChart').getContext('2d');
            if (!departmentChartCtx) return;
        } else {
            return;}}
if (data.totalStudentsMarked === 0) {
        if (departmentChartCtx.canvas.parentNode) {
            departmentChartCtx.canvas.parentNode.innerHTML = `<p style="text-align:center; color:#777;">No attendance data for ${department} - academicYear ${academicYear} to display.</p>`;}
        if (departmentChart) departmentChart.destroy();
        departmentSummary.textContent = `No attendance records found for ${department} - academicYear ${academicYear}.`;
        return;
    } else {
        const parentContainer = departmentChartCtx.canvas.parentNode;
        if (parentContainer && parentContainer.innerHTML.includes('No attendance data for')) {
            parentContainer.innerHTML = '<canvas id="departmentChart"></canvas><div class="chart-overlay" id="departmentChartOverlay">Click a slice for details</div>';
            departmentChartCtx = document.getElementById('departmentChart').getContext('2d');
            if (!departmentChartCtx) return;}
        if (departmentChartCtx.canvas.parentNode) {
            departmentChartCtx.canvas.parentNode.style.display = 'block';}}
if (departmentChart) {
        departmentChart.destroy();}
departmentChart = new Chart(departmentChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent'],
            datasets: [{
                data: [data.totalPresent, data.totalAbsent],
                backgroundColor: ['#2196F3', '#FFC107'], 
                hoverOffset: 4}]},
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',},
                title: {
                    display: true,
                    text: `Attendance for ${department} - academicYear ${academicYear}`},
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = (value / total * 100).toFixed(2);
                            return `${label}: ${value} (${percentage}%)`;}}}},
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const label = departmentChart.data.labels[index];
                    const value = departmentChart.data.datasets[0].data[index];
                    const total = departmentChart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                    const percentage = (value / total * 100).toFixed(2);
                    if (departmentChartOverlay) {
                        departmentChartOverlay.textContent = `${label}: ${percentage}%`;
                        departmentChartOverlay.classList.add('visible');}}}}});
    departmentSummary.textContent = `Present: ${data.totalPresent}, Absent: ${data.totalAbsent} for ${department} - academicYear ${academicYear}.`;}
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.id.replace('Btn', 'Section');
        showSection(sectionId);});});
saveStudentBtn.addEventListener('click', saveStudent);
cancelEditBtn.addEventListener('click', cancelEdit);
clearAllStudentsBtn.addEventListener('click', clearAllStudents);
dailyAttendanceDepartmentSelect.addEventListener('change', () => {
    dailyAttendanceTableBody.innerHTML = '';
    submitDailyAttendanceBtn.classList.add('hidden');});
dailyAttendanceAcademicYearSelect.addEventListener('change', () => {
    dailyAttendanceTableBody.innerHTML = '';
    submitDailyAttendanceBtn.classList.add('hidden');});
loadDailyStudentsBtn.addEventListener('click', loadDailyStudents);
submitDailyAttendanceBtn.addEventListener('click', submitDailyAttendance);
periodAttendanceDepartmentSelect.addEventListener('change', populatePeriodDropdowns);
periodTypeSelect.addEventListener('change', populatePeriodDropdowns);
loadPeriodStudentsBtn.addEventListener('click', loadPeriodStudents);
submitPeriodAttendanceBtn.addEventListener('click', submitPeriodAttendance);
applyLeaveBtn.addEventListener('click', applyLeave);
generateReportBtn.addEventListener('click', async () => {
    const selectedDepartment = reportDepartmentSelect.value;
    const selectedAcademicYear = reportAcademicYearSelect.value;
const overallAttendanceData = await calculateOverallAttendance();
    renderCollegeChart(overallAttendanceData);
if (selectedDepartment && selectedAcademicYear) {
        const departmentAttendanceData = await calculateDepartmentAttendance(selectedDepartment, selectedAcademicYear);
        renderDepartmentChart(departmentAttendanceData, selectedDepartment, selectedAcademicYear);
    } else {
 if (departmentChart) departmentChart.destroy();
        const departmentChartContainer = document.querySelector('#viewReportsSection .chart-wrapper:last-of-type .chart-container');
        if (departmentChartContainer) {
            departmentChartContainer.innerHTML = `<canvas id="departmentChart"></canvas><div class="chart-overlay" id="departmentChartOverlay">Click a slice for details</div>`;}
        if (departmentSummary) {
            departmentSummary.textContent = 'Select a specific department and academicYear to view detailed attendance.';}}});
document.addEventListener('DOMContentLoaded', async () => {
    showSection('addStudentSection'); 
    await renderStudentsList();
    await renderDailyLogbook();
    await renderPeriodLogbook();
    await renderLeaveLogbook();
    const today = new Date().toISOString().split('T')[0];
    dailyAttendanceDateInput.value = today;
    periodAttendanceDateInput.value = today;
    leaveStartDateInput.value = today;
    leaveEndDateInput.value = today;
    collegeChartCtx = null;
    departmentChartCtx = null;});
