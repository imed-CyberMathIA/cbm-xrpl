function checkAuth() {
    const authMessage = document.getElementById('auth-required');
    const coursesContent = document.getElementById('courses-content');
    
    if (web3auth && web3auth.connected) {
        // Utilisateur connecté
        authMessage.style.display = 'none';
        coursesContent.classList.remove('hidden');
    } else {
        // Utilisateur non connecté
        authMessage.style.display = 'block';
        coursesContent.classList.add('hidden');
    }
}

// Vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Mettre à jour l'affichage après login/logout
function updateCoursesAccess(user = null) {
    checkAuth();
} 