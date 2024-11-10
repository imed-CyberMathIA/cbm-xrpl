let currentChildren = [];
let selectedChildId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    
    if (userRole !== 'parent' || !userEmail) {
        window.location.replace('index.html');
        return;
    }
    
    // Afficher l'email du parent
    document.getElementById('parent-email').textContent = userEmail;
    
    // Charger les données une seule fois
    await loadChildren();
});

async function loadChildren() {
    try {
        const response = await fetch('/api/students/my-students', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des enfants');
        }
        
        currentChildren = await response.json();
        displayChildrenInSidebar(currentChildren);
        
        // Si des enfants existent, afficher le premier par défaut
        if (currentChildren.length > 0) {
            displayChildDetails(currentChildren[0]._id);
        } else {
            displayEmptyState();
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function displayChildrenInSidebar(children) {
    const sidebarChildren = document.getElementById('sidebar-children');
    sidebarChildren.innerHTML = children.length ? children.map(child => `
        <div class="child-item ${child._id === selectedChildId ? 'active' : ''}" 
             onclick="displayChildDetails('${child._id}')">
            <img src="${child.avatar}" alt="${child.pseudo}" class="child-avatar">
            <div class="child-info">
                <div class="child-name">${child.firstName} ${child.lastName}</div>
                <div class="child-grade">${child.grade}</div>
            </div>
        </div>
    `).join('') : '<p>Aucun enfant inscrit</p>';
}

function displayChildDetails(childId) {
    selectedChildId = childId;
    const child = currentChildren.find(c => c._id === childId);
    if (!child) return;

    // Mettre à jour la sélection dans la sidebar
    document.querySelectorAll('.child-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.child-item[onclick*="${childId}"]`)?.classList.add('active');

    const container = document.querySelector('.child-details-container');
    container.innerHTML = `
        <div class="child-header">
            <div class="child-info">
                <h2>${child.firstName} ${child.lastName}</h2>
                <p>Niveau : ${child.grade}</p>
            </div>
            <div class="child-actions">
                <button class="btn-secondary" onclick="editChild('${child._id}')">
                    <i class="fas fa-edit"></i> Modifier
                </button>
            </div>
        </div>

        <div class="child-stats">
            <div class="stat-card">
                <h3>Progression globale</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${calculateOverallProgress(child)}%"></div>
                </div>
                <span>${calculateOverallProgress(child)}%</span>
            </div>
            <div class="stat-card">
                <h3>Cours suivis</h3>
                <span class="stat-value">${child.enrolledCourses.length}</span>
            </div>
            <div class="stat-card">
                <h3>Prochaine session</h3>
                <span>${getNextSessionInfo(child)}</span>
            </div>
        </div>

        <div class="sessions-list">
            <h3>Sessions à venir</h3>
            ${displayUpcomingSessions(child)}
        </div>

        <div class="reports-list">
            <h3>Derniers comptes-rendus</h3>
            ${displayReports(child)}
        </div>
    `;
}

function calculateOverallProgress(child) {
    if (!child.progress || child.progress.length === 0) return 0;
    const total = child.progress.reduce((sum, p) => sum + p.overallProgress, 0);
    return Math.round(total / child.progress.length);
}

function getNextSessionInfo(child) {
    if (!child.upcomingSessions || child.upcomingSessions.length === 0) {
        return 'Aucune session planifiée';
    }
    const nextSession = child.upcomingSessions
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    return new Date(nextSession.date).toLocaleString();
}

function displayUpcomingSessions(child) {
    if (!child.upcomingSessions || child.upcomingSessions.length === 0) {
        return '<p>Aucune session planifiée</p>';
    }

    return child.upcomingSessions
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(session => `
            <div class="session-card">
                <h4>${session.courseTitle}</h4>
                <p><i class="far fa-calendar"></i> ${new Date(session.date).toLocaleString()}</p>
                <p><i class="far fa-clock"></i> ${session.duration} minutes</p>
                ${session.meetingLink ? `
                    <a href="${session.meetingLink}" target="_blank" class="btn-primary">
                        Rejoindre la session
                    </a>
                ` : ''}
            </div>
        `).join('');
}

function displayReports(child) {
    if (!child.progress || child.progress.length === 0) {
        return '<p>Aucun compte-rendu disponible</p>';
    }

    return child.progress.map(p => `
        <div class="report-card">
            <h4>${p.courseId.title}</h4>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${p.overallProgress}%"></div>
            </div>
            <p>Progression : ${p.overallProgress}%</p>
            <p>Dernière activité : ${new Date(p.completedLessons[p.completedLessons.length - 1]?.completedAt).toLocaleDateString()}</p>
        </div>
    `).join('');
}

function showAddChildModal() {
    const modal = document.getElementById('add-child-modal');
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('add-child-modal').style.display = 'none';
}

// Gestionnaire du formulaire d'ajout d'enfant
document.getElementById('add-child-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        pseudo: document.getElementById('pseudo').value,
        password: document.getElementById('password').value,
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
            closeModal();
            await loadChildren();
            e.target.reset();
        } else {
            const error = await response.json();
            alert(error.message || 'Erreur lors de la création du compte');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la création du compte');
    }
});

// Fermer le modal en cliquant en dehors
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

function displayEmptyState() {
    const container = document.querySelector('.child-details-container');
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-user-plus fa-3x"></i>
            <h2>Aucun enfant inscrit</h2>
            <p>Commencez par ajouter votre premier enfant</p>
            <button class="btn-primary" onclick="showAddChildModal()">
                Ajouter un enfant
            </button>
        </div>
    `;
}