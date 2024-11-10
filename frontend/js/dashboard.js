document.addEventListener('DOMContentLoaded', async function() {
    // Vérifier l'authentification via Web3Auth avant d'initialiser le tableau de bord
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    // Initialiser les composants si l'utilisateur est authentifié
    initializeDashboard();
    
    // Gérer la navigation
    handleNavigation();
    
    // Mettre à jour les cercles de progression
    updateProgressCircles();
});

/*async function checkAuth() {
    try {
        // Vérifier si Web3Auth est initialisé et connecté
        if (!window.web3auth) {
            console.log("Web3Auth non initialisé");
            window.location.href = 'index.html';
            return false;
        }
        
        const isConnected = await window.web3auth.isAuthenticated();
        if (!isConnected) {
            console.log("Utilisateur non connecté");
            window.location.href = 'index.html';
            return false;
        }

        // Récupérer les informations de l'utilisateur
        const user = await window.web3auth.getUserInfo();
        if (!user) {
            console.log("Impossible de récupérer les informations utilisateur");
            window.location.href = 'index.html';
            return false;
        }

        // Charger les informations de l'utilisateur
        loadUserInfo(user);
        return true;
        
    } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        window.location.href = 'index.html';
        return false;
    }
}
*/

function loadUserInfo(user) {
    // Utiliser les informations réelles de l'utilisateur
    document.getElementById('userName').textContent = user.name || user.email || 'Utilisateur';
    document.getElementById('userLevel').textContent = `Niveau: ${user.level || '1ère S'}`;
    
    // Simuler les données de progression (à remplacer par des données réelles)
    const progress = {
        math: 75,
        info: 45
    };
    
    updateProgress(progress);
}

function updateProgress(progress) {
    const circles = document.querySelectorAll('.progress-circle');
    circles.forEach(circle => {
        const subject = circle.parentElement.querySelector('h3').textContent.toLowerCase();
        const progressValue = subject.includes('math') ? progress.math : progress.info;
        
        // Mettre à jour le cercle de progression
        circle.style.background = `conic-gradient(#00A6FF ${progressValue}%, #f0f0f0 0%)`;
        circle.querySelector('.progress-percentage').textContent = `${progressValue}%`;
    });
}

function handleNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Retirer la classe active de tous les liens
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            
            // Ajouter la classe active au lien cliqué
            link.parentElement.classList.add('active');
            
            // Afficher la section correspondante
            const targetId = link.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Modifier la gestion de la déconnexion
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        if (window.web3auth) {
            await window.web3auth.logout();
        }
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
    }
});

// Animation des cercles de progression
function updateProgressCircles() {
    const circles = document.querySelectorAll('.progress-circle');
    circles.forEach(circle => {
        const progress = parseInt(circle.dataset.progress);
        circle.style.background = `conic-gradient(#00A6FF ${progress}%, #f0f0f0 0%)`;
    });
}

// Initialiser les composants du tableau de bord
function initializeDashboard() {
    // Charger les prochains objectifs
    loadNextObjectives();
    
    // Charger les certifications
    loadCertifications();
}

function loadNextObjectives() {
    // Cette fonction pourrait charger dynamiquement les objectifs depuis une API
    console.log('Chargement des objectifs...');
}

function loadCertifications() {
    // Cette fonction pourrait charger dynamiquement les certifications depuis une API
    console.log('Chargement des certifications...');
} 