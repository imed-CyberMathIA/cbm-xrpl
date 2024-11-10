let currentUser = null;

async function loadStudentProfiles() {
    try {
        const response = await fetch('/api/students/my-students', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const students = await response.json();
        displayStudents(students);
    } catch (error) {
        console.error('Erreur lors du chargement des profils:', error);
    }
}

function displayStudents(students) {
    const grid = document.getElementById('students-grid');
    grid.innerHTML = '';

    students.forEach(student => {
        const card = createStudentCard(student);
        grid.appendChild(card);
    });
}

function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    
    const progress = calculateOverallProgress(student.progress);
    const nextSession = getNextSession(student.upcomingSessions);

    card.innerHTML = `
        <div class="student-header">
            <img src="${student.avatar}" alt="${student.pseudo}" class="student-avatar">
            <h3>${student.pseudo}</h3>
            <span class="student-grade">${student.grade}</span>
        </div>
        <div class="student-info">
            <div class="progress-bar">
                <div class="progress" style="width: ${progress}%"></div>
                <span>${progress}% de progression</span>
            </div>
            ${nextSession ? `
                <div class="next-session">
                    <h4>Prochaine session</h4>
                    <p>${formatDate(nextSession.date)}</p>
                    <p>${nextSession.courseTitle}</p>
                </div>
            ` : ''}
            <div class="enrolled-courses">
                <h4>Cours suivis</h4>
                <ul>
                    ${student.enrolledCourses.map(course => `
                        <li>${course.courseId.title}</li>
                    `).join('')}
                </ul>
            </div>
        </div>
        <button onclick="viewStudentDetails('${student._id}')" class="btn-secondary">
            Voir les détails
        </button>
    `;

    return card;
}

// Fonctions utilitaires
function calculateOverallProgress(progress) {
    if (!progress || progress.length === 0) return 0;
    const total = progress.reduce((sum, course) => sum + course.overallProgress, 0);
    return Math.round(total / progress.length);
}

function getNextSession(sessions) {
    if (!sessions || sessions.length === 0) return null;
    const now = new Date();
    return sessions
        .filter(session => new Date(session.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
}

function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Gestionnaire de formulaire
document.getElementById('new-student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        pseudo: document.getElementById('pseudo').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        grade: document.getElementById('grade').value
    };

    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            await loadStudentProfiles();
            e.target.reset();
        } else {
            const error = await response.json();
            alert(error.message || 'Erreur lors de la création du profil');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la création du profil');
    }
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (web3auth && web3auth.connected) {
        loadStudentProfiles();
    }
}); 