const API_URL = 'http://localhost:3000';
let editMode = false;
let students = [];
let gradeChart = null;
let attendanceChart = null;

// Theme handling
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme from localStorage
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Handle photo upload
async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('photoPreview');
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Perform advanced search
async function performAdvancedSearch() {
    const filters = {
        name: document.getElementById('searchName').value,
        ageRange: {
            min: parseInt(document.getElementById('ageMin').value) || 0,
            max: parseInt(document.getElementById('ageMax').value) || 100
        },
        grades: Array.from(document.getElementById('searchGrades').selectedOptions).map(opt => opt.value),
        status: Array.from(document.getElementById('searchStatus').selectedOptions).map(opt => opt.value),
        attendanceRate: {
            min: parseInt(document.getElementById('attendanceMin').value) || 0,
            max: parseInt(document.getElementById('attendanceMax').value) || 100
        },
        academicScore: {
            min: parseInt(document.getElementById('scoreMin').value) || 0,
            max: parseInt(document.getElementById('scoreMax').value) || 100
        },
        sortBy: document.getElementById('sortBy').value,
        sortOrder: document.getElementById('sortOrder').value
    };

    try {
        const response = await fetch(`${API_URL}/students/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filters)
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const data = await response.json();
        displayStudents(data);
        bootstrap.Modal.getInstance(document.getElementById('advancedSearchModal')).hide();
    } catch (error) {
        showError('Error performing search: ' + error.message);
    }
}

// Add academic record
async function addAcademicRecord(studentId) {
    document.getElementById('academicStudentId').value = studentId;
    document.getElementById('year').value = new Date().getFullYear();
    new bootstrap.Modal(document.getElementById('academicModal')).show();
}

// Submit academic record
async function submitAcademicRecord() {
    const studentId = document.getElementById('academicStudentId').value;
    const record = {
        subject: document.getElementById('subject').value,
        score: parseInt(document.getElementById('score').value),
        term: document.getElementById('term').value,
        year: document.getElementById('year').value,
        teacher: document.getElementById('teacher').value,
        comments: document.getElementById('comments').value
    };

    try {
        const response = await fetch(`${API_URL}/students/${studentId}/academic`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        });

        if (!response.ok) {
            throw new Error('Failed to add academic record');
        }

        bootstrap.Modal.getInstance(document.getElementById('academicModal')).hide();
        await fetchStudents();
        showSuccess('Academic record added successfully');
    } catch (error) {
        showError('Error adding academic record: ' + error.message);
    }
}

// Download import template
function downloadTemplate(format = 'xlsx') {
    const template = {
        headers: ['name', 'age', 'grade', 'address', 'guardianName', 'guardianRelationship', 
                 'guardianPhone', 'guardianEmail', 'guardianAddress'],
        sample: ['John Doe', '15', 'A', '123 Main St', 'Jane Doe', 'Mother', 
                '+1234567890', 'jane@example.com', '123 Main St']
    };

    let content;
    let filename;
    let type;

    if (format === 'csv') {
        content = template.headers.join(',') + '\\n' + template.sample.join(',');
        filename = 'student_template.csv';
        type = 'text/csv';
    } else {
        // For simplicity, we'll just use JSON for the example
        content = JSON.stringify({ headers: template.headers, samples: [template.sample] }, null, 2);
        filename = 'student_template.json';
        type = 'application/json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import bulk data
async function importBulkData() {
    const file = document.getElementById('bulkImportFile').files[0];
    if (!file) {
        showError('Please select a file to import');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            let data;
            if (file.name.endsWith('.csv')) {
                data = parseCSV(e.target.result);
            } else {
                data = JSON.parse(e.target.result);
            }

            const response = await fetch(`${API_URL}/students/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ students: data })
            });

            if (!response.ok) {
                throw new Error('Bulk import failed');
            }

            const result = await response.json();
            bootstrap.Modal.getInstance(document.getElementById('bulkImportModal')).hide();
            await fetchStudents();
            showSuccess(`Successfully imported ${result.success} students. Failed: ${result.failed}`);
            
            if (result.errors.length > 0) {
                showError('Errors:\\n' + result.errors.join('\\n'));
            }
        } catch (error) {
            showError('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Parse CSV data
function parseCSV(csv) {
    const lines = csv.split('\\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const student = {};
        headers.forEach((header, index) => {
            student[header] = values[index];
        });
        return student;
    });
}

// Success message
function showSuccess(message) {
    // You can implement a more sophisticated notification system
    alert(message);
}

// Initialize charts
function initCharts() {
    const gradeCtx = document.getElementById('gradeChart').getContext('2d');
    const attendanceCtx = document.getElementById('attendanceChart').getContext('2d');

    gradeChart = new Chart(gradeCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Students per Grade',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    attendanceChart = new Chart(attendanceCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Attendance Rate (%)',
                data: [],
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Update statistics
async function updateStatistics() {
    try {
        const response = await fetch(`${API_URL}/statistics`);
        const stats = await response.json();
        
        document.getElementById('totalStudents').textContent = stats.totalStudents;
        document.getElementById('activeStudents').textContent = stats.activeStudents;
        document.getElementById('averageAge').textContent = stats.averageAge.toFixed(1);
        document.getElementById('attendanceRate').textContent = `${stats.attendanceRate.toFixed(1)}%`;

        // Update grade distribution chart
        const grades = Object.keys(stats.gradeDistribution);
        const counts = Object.values(stats.gradeDistribution);
        
        gradeChart.data.labels = grades;
        gradeChart.data.datasets[0].data = counts;
        gradeChart.update();

        // Update attendance chart with the last 7 days
        const dates = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString();
        }).reverse();
        
        const attendanceData = dates.map(() => Math.random() * 100); // Example data
        
        attendanceChart.data.labels = dates;
        attendanceChart.data.datasets[0].data = attendanceData;
        attendanceChart.update();
    } catch (error) {
        showError('Error updating statistics: ' + error.message);
    }
}

// Export data
async function exportData() {
    try {
        const response = await fetch(`${API_URL}/export`);
        const data = await response.json();
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `student_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        showError('Error exporting data: ' + error.message);
    }
}

// Import data
async function importData(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                const response = await fetch(`${API_URL}/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data: data.data })
                });
                
                if (!response.ok) {
                    throw new Error('Import failed');
                }
                
                await fetchStudents();
                showError('Data imported successfully!');
            } catch (error) {
                showError('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    } catch (error) {
        showError('Error reading file: ' + error.message);
    }
}

// Record attendance
async function recordAttendance(studentId) {
    document.getElementById('attendanceStudentId').value = studentId;
    document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
    new bootstrap.Modal(document.getElementById('attendanceModal')).show();
}

// Submit attendance
async function submitAttendance() {
    const studentId = document.getElementById('attendanceStudentId').value;
    const attendance = {
        date: document.getElementById('attendanceDate').value,
        status: document.getElementById('attendanceStatus').value,
        note: document.getElementById('attendanceNote').value
    };

    try {
        const response = await fetch(`${API_URL}/students/${studentId}/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendance)
        });
        
        if (!response.ok) {
            throw new Error('Failed to record attendance');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('attendanceModal')).hide();
        await fetchStudents();
        showError('Attendance recorded successfully!');
    } catch (error) {
        showError('Error recording attendance: ' + error.message);
    }
}

// Fetch all students and display them
async function fetchStudents() {
    try {
        const response = await fetch(`${API_URL}/students`);
        const data = await response.json();
        students = data.students;
        filterAndDisplayStudents();
    } catch (error) {
        showError('Error fetching students: ' + error.message);
    }
}

// Filter and display students based on search and filter criteria
function filterAndDisplayStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    let filteredStudents = students.filter(student => {
        const matchesSearch = 
            student.name.toLowerCase().includes(searchTerm) ||
            student.grade.toLowerCase().includes(searchTerm) ||
            student.address.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Sort students
    filteredStudents.sort((a, b) => {
        switch(sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'age':
                return a.age - b.age;
            case 'grade':
                return a.grade.localeCompare(b.grade);
            case 'updatedAt':
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            default:
                return 0;
        }
    });

    displayStudents(filteredStudents);
}

// Display students in the table
function displayStudents(studentsToDisplay) {
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '';

    studentsToDisplay.forEach(student => {
        const row = document.createElement('tr');
        const updatedDate = new Date(student.updatedAt).toLocaleString();
        const statusClass = student.status === 'active' ? 'text-success' : 'text-danger';
        
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.grade}</td>
            <td>${student.address}</td>
            <td><span class="${statusClass}">${student.status}</span></td>
            <td>${updatedDate}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="editStudent('${student.id}')">Edit</button>
                <button class="btn btn-sm btn-danger btn-action" onclick="deleteStudent('${student.id}')">Delete</button>
                <button class="btn btn-sm btn-secondary btn-action" onclick="recordAttendance('${student.id}')">Record Attendance</button>
                <button class="btn btn-sm btn-secondary btn-action" onclick="addAcademicRecord('${student.id}')">Add Academic Record</button>
            </td>
        `;
        studentList.appendChild(row);
    });
}

// Handle form submission
document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentData = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        grade: document.getElementById('grade').value,
        address: document.getElementById('address').value,
        status: document.getElementById('status').value,
        photo: document.getElementById('photoPreview').src || undefined,
        guardian: {
            name: document.getElementById('guardianName').value,
            relationship: document.getElementById('guardianRelationship').value,
            phone: document.getElementById('guardianPhone').value,
            email: document.getElementById('guardianEmail').value,
            address: document.getElementById('guardianAddress').value
        }
    };

    try {
        if (editMode) {
            const studentId = document.getElementById('studentId').value;
            await updateStudent(studentId, studentData);
        } else {
            await createStudent(studentData);
        }
        resetForm();
        fetchStudents();
        updateStatistics();
    } catch (error) {
        showError('Error saving student: ' + error.message);
    }
});

// Reset form
function resetForm() {
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoPreview').src = '';
    document.getElementById('formTitle').textContent = 'Add New Student';
    editMode = false;
}

// Edit student
async function editStudent(id) {
    try {
        const response = await fetch(`${API_URL}/students/${id}`);
        const student = await response.json();
        
        document.getElementById('studentId').value = student.id;
        document.getElementById('name').value = student.name;
        document.getElementById('age').value = student.age;
        document.getElementById('grade').value = student.grade;
        document.getElementById('address').value = student.address;
        document.getElementById('status').value = student.status;
        
        if (student.photo) {
            document.getElementById('photoPreview').src = student.photo;
            document.getElementById('photoPreview').style.display = 'block';
        }
        
        if (student.guardian) {
            document.getElementById('guardianName').value = student.guardian.name;
            document.getElementById('guardianRelationship').value = student.guardian.relationship;
            document.getElementById('guardianPhone').value = student.guardian.phone;
            document.getElementById('guardianEmail').value = student.guardian.email;
            document.getElementById('guardianAddress').value = student.guardian.address;
        }
        
        document.getElementById('formTitle').textContent = 'Edit Student';
        editMode = true;
    } catch (error) {
        showError('Error fetching student details: ' + error.message);
    }
}

// Event listeners for search and filter controls
document.getElementById('searchInput').addEventListener('input', filterAndDisplayStudents);
document.getElementById('statusFilter').addEventListener('change', filterAndDisplayStudents);
document.getElementById('sortBy').addEventListener('change', filterAndDisplayStudents);

// Show error message
function showError(message) {
    alert(message);
}

// Create new student
async function createStudent(studentData) {
    const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
    });
    
    if (!response.ok) {
        throw new Error('Failed to create student');
    }
}

// Update existing student
async function updateStudent(id, studentData) {
    const response = await fetch(`${API_URL}/students/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
    });
    
    if (!response.ok) {
        throw new Error('Failed to update student');
    }
}

// Delete student
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete student');
        }
        
        fetchStudents();
    } catch (error) {
        showError('Error deleting student: ' + error.message);
    }
}

// Initial setup
initTheme();
initCharts();
fetchStudents();
updateStatistics();

// View student timeline
async function viewTimeline(studentId) {
    try {
        const response = await fetch(`${API_URL}/students/${studentId}/timeline`);
        if (!response.ok) {
            throw new Error('Failed to fetch timeline');
        }

        const timeline = await response.json();
        const timelineContainer = document.getElementById('studentTimeline');
        timelineContainer.innerHTML = '';

        timeline.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `timeline-item ${event.type}`;
            
            const date = new Date(event.date).toLocaleDateString();
            eventElement.innerHTML = `
                <div class="timeline-date">${date}</div>
                <div class="timeline-content">
                    <div class="timeline-title">${event.title}</div>
                    <div class="timeline-details">
                        ${formatEventDetails(event)}
                    </div>
                </div>
            `;
            
            timelineContainer.appendChild(eventElement);
        });

        new bootstrap.Modal(document.getElementById('timelineModal')).show();
    } catch (error) {
        showError('Error fetching timeline: ' + error.message);
    }
}

// Format event details based on type
function formatEventDetails(event) {
    switch (event.type) {
        case 'academic':
            return `Subject: ${event.details.subject}<br>
                    Score: ${event.details.score}%<br>
                    Teacher: ${event.details.teacher}`;
        case 'attendance':
            return `Status: ${event.details.status}<br>
                    ${event.details.note ? `Note: ${event.details.note}` : ''}`;
        case 'communication':
            return `Type: ${event.details.type}<br>
                    Subject: ${event.details.subject}<br>
                    Status: ${event.details.status}`;
        case 'document':
            return `Category: ${event.details.category}<br>
                    Type: ${event.details.type}`;
        default:
            return '';
    }
}

// Send communication
async function sendCommunication() {
    const studentId = document.getElementById('communicationStudentId').value;
    const type = document.getElementById('communicationType').value;
    const subject = document.getElementById('communicationSubject').value;
    const content = document.getElementById('communicationContent').value;
    const status = document.getElementById('communicationStatus').value;
    const scheduleTime = document.getElementById('communicationScheduleTime').value;

    const communication = {
        type,
        subject,
        content,
        status,
        sender: 'System',
        recipient: studentId,
        scheduledFor: status === 'scheduled' ? scheduleTime : undefined
    };

    try {
        const response = await fetch(`${API_URL}/students/${studentId}/communicate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(communication)
        });

        if (!response.ok) {
            throw new Error('Failed to send communication');
        }

        bootstrap.Modal.getInstance(document.getElementById('communicationModal')).hide();
        showSuccess('Communication sent successfully');
    } catch (error) {
        showError('Error sending communication: ' + error.message);
    }
}

// Generate report
async function generateReport() {
    const studentId = document.getElementById('reportStudentId').value;
    const templateId = document.getElementById('reportTemplate').value;
    const teacherComments = document.getElementById('teacherComments').value;
    const recommendations = document.getElementById('recommendations').value;

    try {
        const response = await fetch(`${API_URL}/students/${studentId}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                templateId,
                teacherComments,
                recommendations
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate report');
        }

        const result = await response.json();
        bootstrap.Modal.getInstance(document.getElementById('reportModal')).hide();
        
        // Display or download the report
        const blob = new Blob([result.document.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.document.name + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccess('Report generated successfully');
    } catch (error) {
        showError('Error generating report: ' + error.message);
    }
}

// Add schedule entry
async function addScheduleEntry() {
    const studentId = document.getElementById('scheduleStudentId').value;
    const entry = {
        title: document.getElementById('scheduleTitle').value,
        type: document.getElementById('scheduleType').value,
        startTime: document.getElementById('scheduleStart').value,
        endTime: document.getElementById('scheduleEnd').value,
        location: document.getElementById('scheduleLocation').value,
        description: document.getElementById('scheduleDescription').value,
        recurring: document.getElementById('scheduleRecurring').checked,
        recurrencePattern: document.getElementById('scheduleRecurring').checked ? 
                          document.getElementById('recurrencePattern').value : undefined
    };

    try {
        const response = await fetch(`${API_URL}/students/${studentId}/schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
        });

        if (!response.ok) {
            throw new Error('Failed to add schedule entry');
        }

        bootstrap.Modal.getInstance(document.getElementById('scheduleModal')).hide();
        showSuccess('Schedule entry added successfully');
    } catch (error) {
        showError('Error adding schedule entry: ' + error.message);
    }
}

// Upload document
async function uploadDocument() {
    const studentId = document.getElementById('documentStudentId').value;
    const file = document.getElementById('documentFile').files[0];
    if (!file) {
        showError('Please select a file to upload');
        return;
    }

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const document = {
                name: document.getElementById('documentName').value,
                type: file.type,
                content: e.target.result,
                category: document.getElementById('documentCategory').value
            };

            const response = await fetch(`${API_URL}/students/${studentId}/documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(document)
            });

            if (!response.ok) {
                throw new Error('Failed to upload document');
            }

            bootstrap.Modal.getInstance(document.getElementById('documentModal')).hide();
            showSuccess('Document uploaded successfully');
        };
        reader.readAsDataURL(file);
    } catch (error) {
        showError('Error uploading document: ' + error.message);
    }
}

// Event listeners for modal controls
document.getElementById('communicationStatus').addEventListener('change', function() {
    const scheduleContainer = document.getElementById('scheduleTimeContainer');
    scheduleContainer.style.display = this.value === 'scheduled' ? 'block' : 'none';
});

document.getElementById('scheduleRecurring').addEventListener('change', function() {
    const recurrenceContainer = document.getElementById('recurrenceContainer');
    recurrenceContainer.style.display = this.checked ? 'block' : 'none';
});
