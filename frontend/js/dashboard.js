document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des sections
    initializeSections();
    // Initialisation du calendrier
    initializeCalendar();
    // Gestion des filtres de devoirs
    initializeHomeworkFilters();
    // Animation des cercles de progression
    initializeProgressCircles();
});

function initializeSections() {
    const navItems = document.querySelectorAll('.sidebar-nav li');
    const sections = document.querySelectorAll('.dashboard-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Retirer la classe active de tous les éléments
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Ajouter la classe active à l'élément cliqué
            item.classList.add('active');
            
            // Afficher la section correspondante avec animation
            const sectionId = item.dataset.section;
            const targetSection = document.getElementById(sectionId);
            
            // Animation de transition
            targetSection.style.opacity = '0';
            targetSection.classList.add('active');
            
            setTimeout(() => {
                targetSection.style.opacity = '1';
            }, 50);
        });
    });
}

function initializeProgressCircles() {
    const circles = document.querySelectorAll('.progress-circle');
    
    circles.forEach(circle => {
        const percentage = circle.querySelector('.progress-percentage').textContent;
        const progress = parseInt(percentage);
        circle.style.setProperty('--progress', `${progress}%`);
        
        // Animation au chargement
        animateProgress(circle, progress);
    });
}

function animateProgress(circle, targetProgress) {
    let progress = 0;
    const duration = 1500; // 1.5 secondes
    const interval = 10; // Mise à jour tous les 10ms
    const steps = duration / interval;
    const increment = targetProgress / steps;
    
    const animation = setInterval(() => {
        progress += increment;
        if (progress >= targetProgress) {
            progress = targetProgress;
            clearInterval(animation);
        }
        circle.style.setProperty('--progress', `${progress}%`);
    }, interval);
}

function initializeHomeworkFilters() {
    const filterButtons = document.querySelectorAll('.btn-filter');
    const homeworkCards = document.querySelectorAll('.homework-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Mise à jour des boutons actifs
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filtrage des devoirs
            const filter = button.textContent.toLowerCase();
            
            homeworkCards.forEach(card => {
                if (filter === 'tous') {
                    showCard(card);
                } else if (filter === 'à faire' && !card.classList.contains('completed')) {
                    showCard(card);
                } else if (filter === 'terminés' && card.classList.contains('completed')) {
                    showCard(card);
                } else {
                    hideCard(card);
                }
            });
        });
    });
}

function showCard(card) {
    card.style.display = 'block';
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 50);
}

function hideCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
        card.style.display = 'none';
    }, 300);
}

function initializeCalendar() {
    const calendar = document.querySelector('.calendar-grid');
    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');
    let currentDate = new Date();
    
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Mise à jour du titre du calendrier
        document.querySelector('.calendar-nav h3').textContent = 
            new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
        
        // Génération du calendrier
        let calendarHTML = `
            <div class="calendar-header">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mer</span>
                <span>Jeu</span>
                <span>Ven</span>
                <span>Sam</span>
                <span>Dim</span>
            </div>
        `;
        
        let dayCount = 1;
        for (let i = 0; i < 6; i++) {
            calendarHTML += '<div class="calendar-week">';
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startingDay) {
                    calendarHTML += '<div class="calendar-day empty"></div>';
                } else if (dayCount > daysInMonth) {
                    calendarHTML += '<div class="calendar-day empty"></div>';
                } else {
                    const isToday = dayCount === new Date().getDate() && 
                                  month === new Date().getMonth() && 
                                  year === new Date().getFullYear();
                    calendarHTML += `
                        <div class="calendar-day ${isToday ? 'today' : ''}">
                            <span>${dayCount}</span>
                        </div>
                    `;
                    dayCount++;
                }
            }
            calendarHTML += '</div>';
        }
        
        calendar.innerHTML = calendarHTML;
    }
    
    // Initialisation du calendrier
    renderCalendar(currentDate);
    
    // Gestion des boutons de navigation
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });
    
    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });
}

// Gestion des actions des boutons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-join')) {
        // Simulation de la redirection vers la salle de cours
        alert('Redirection vers la salle de cours virtuelle...');
    } else if (e.target.classList.contains('btn-resources')) {
        // Simulation du téléchargement des ressources
        alert('Téléchargement des ressources...');
    } else if (e.target.classList.contains('btn-reminder')) {
        // Simulation de l'ajout d'un rappel
        e.target.innerHTML = '<i class="fas fa-check"></i> Rappel ajouté';
        e.target.classList.add('active');
    }
});

// Gestion de la déconnexion
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        window.location.href = 'index.html';
    }
}); 