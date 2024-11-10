const clientId = "BNQSfZeXcErHErBPe8BhKTYHO29XecKhlEmTO9JbgtlLXqi5b_D6MyVWoF2WsyS9sAmijqSDPYcptaQg-3zMVJo";

let web3auth = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        web3auth = new window.Modal.Web3Auth({
            clientId,
            web3AuthNetwork: "sapphire_mainnet",
            chainConfig: {
                chainNamespace: "other",
                chainId: "0x1",
                rpcTarget: "https://mainnet.infura.io/v3/",
                displayName: "Main Network",
                blockExplorer: "https://etherscan.io",
                ticker: "ETH",
                tickerName: "Ethereum"
            }
        });

        await web3auth.initModal();

        const loginButton = document.getElementById('login-button');
        if (loginButton) {
            loginButton.onclick = showInitialRoleModal;
        }

        if (await web3auth.connected) {
            const user = await web3auth.getUserInfo();
            const role = localStorage.getItem('userRole');
            
            if (user && role) {
                await updateLoginButton(user);
                updateNavigation(role);
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
});

function showInitialRoleModal() {
    const modal = document.createElement('div');
    modal.className = 'modal role-selection-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal(this)">×</button>
            <h2>Bienvenue sur CyberMathIA</h2>
            <p>Je suis :</p>
            <div class="role-buttons">
                <button onclick="handleRoleSelection('student')" class="role-btn student-btn">
                    <img src="img/student-icon.svg" alt="Élève">
                    <span>Un élève</span>
                </button>
                <button onclick="handleRoleSelection('parent')" class="role-btn parent-btn">
                    <img src="img/parent-icon.svg" alt="Parent">
                    <span>Un parent</span>
                </button>
                <button onclick="handleRoleSelection('teacher')" class="role-btn teacher-btn">
                    <img src="img/teacher-icon.svg" alt="Professeur">
                    <span>Un professeur</span>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeModal(element) {
    const modal = element.closest('.modal');
    if (modal) {
        modal.remove();
    }
}

async function login() {
    if (!web3auth) {
        console.log("Web3Auth not initialized");
        return;
    }
    try {
        const provider = await web3auth.connect();
        if (provider) {
            const user = await web3auth.getUserInfo();
            const selectedRole = localStorage.getItem('selectedRole');
            
            const response = await fetch('/api/auth/verify-web3auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.email,
                    web3authId: user.web3authId,
                    role: selectedRole
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('userRole', selectedRole);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', user.email);
                updateLoginButton(user);
                redirectToUserDashboard(selectedRole);
            }
        }
    } catch (error) {
        console.error("Error logging in:", error);
    }
}

function showRoleSelectionModal(user) {
    const modal = document.createElement('div');
    modal.className = 'modal role-selection-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Bienvenue ${user.email}</h2>
            <p>Veuillez sélectionner votre profil :</p>
            <div class="role-buttons">
                <button onclick="selectRole('student')" class="role-btn student-btn">
                    <img src="img/student-icon.svg" alt="Élève">
                    <span>Je suis un élève</span>
                </button>
                <button onclick="selectRole('parent')" class="role-btn parent-btn">
                    <img src="img/parent-icon.svg" alt="Parent">
                    <span>Je suis un parent</span>
                </button>
                <button onclick="selectRole('teacher')" class="role-btn teacher-btn">
                    <img src="img/teacher-icon.svg" alt="Professeur">
                    <span>Je suis un professeur</span>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function selectRole(role) {
    try {
        localStorage.setItem('userRole', role);
        
        const response = await fetch('/api/auth/set-role', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await web3auth.provider.request({ method: 'eth_accounts' })[0]}`
            },
            body: JSON.stringify({ role })
        });

        if (response.ok) {
            redirectToUserDashboard(role);
        } else {
            throw new Error('Erreur lors de la définition du rôle');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la sélection du rôle');
    }
}

function redirectToUserDashboard(role) {
    switch(role) {
        case 'student':
            window.location.replace('student-dashboard.html');
            break;
        case 'parent':
            window.location.replace('parent-dashboard.html');
            break;
        case 'teacher':
            window.location.replace('teacher-dashboard.html');
            break;
        default:
            console.error('Rôle inconnu');
    }
}

async function logout() {
    if (!web3auth) {
        console.log("Web3Auth not initialized");
        return;
    }
    try {
        await web3auth.logout();
        localStorage.removeItem('userRole');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        updateLoginButton();
        console.log("Logged out");
        window.location.replace('index.html');
    } catch (error) {
        console.error("Error logging out:", error);
    }
}

function showStudentLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal student-login-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Connexion Élève</h2>
            <form id="student-login-form">
                <div class="form-group">
                    <label for="pseudo">Pseudo</label>
                    <input type="text" id="pseudo" required>
                </div>
                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <input type="password" id="password" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Se connecter</button>
                    <button type="button" class="btn-secondary" onclick="showInitialRoleModal()">Retour</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('student-login-form').addEventListener('submit', handleStudentLogin);
}

async function handleRoleSelection(role) {
    const modal = document.querySelector('.role-selection-modal');
    if (modal) {
        modal.remove();
    }
    
    if (role === 'student') {
        showStudentLoginModal();
    } else {
        try {
            localStorage.setItem('selectedRole', role);
            const provider = await web3auth.connect();
            if (provider) {
                const user = await web3auth.getUserInfo();
                console.log("User info:", user);
                
                const response = await fetch('/api/auth/verify-web3auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: user.email,
                        web3authId: user.web3authId,
                        role: role
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("Auth response:", data);
                    
                    localStorage.setItem('userRole', role);
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userEmail', user.email);
                    
                    await updateLoginButton(user);
                    updateNavigation(role);
                    
                    if (role === 'parent') {
                        window.location.href = 'parent-dashboard.html';
                    } else if (role === 'teacher') {
                        window.location.href = 'teacher-dashboard.html';
                    }
                } else {
                    throw new Error('Erreur de réponse du serveur');
                }
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            alert('Erreur lors de la connexion');
        }
    }
}

async function handleStudentLogin(e) {
    e.preventDefault();
    
    const pseudo = document.getElementById('pseudo').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/auth/student-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pseudo, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('userRole', 'student');
            localStorage.setItem('token', data.token);
            localStorage.setItem('studentId', data.studentId);
            window.location.replace('student-dashboard.html');
        } else {
            const error = await response.json();
            alert(error.message || 'Erreur de connexion');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la connexion');
    }
}

function updateNavigation(role) {
    const dashboardLink = document.querySelector('.dashboard-link');
    if (dashboardLink) {
        dashboardLink.classList.remove('hidden');
        const link = dashboardLink.querySelector('a');
        if (link) {
            switch(role) {
                case 'parent':
                    link.href = 'parent-dashboard.html';
                    break;
                case 'teacher':
                    link.href = 'teacher-dashboard.html';
                    break;
                case 'student':
                    link.href = 'student-dashboard.html';
                    break;
            }
        }
    }
}

async function updateLoginButton(user = null) {
    const loginButton = document.getElementById('login-button');
    if (!loginButton) return;

    if (user) {
        loginButton.innerHTML = `
            <span class="user-info">${user.email || 'Utilisateur'}</span>
            <span>Se déconnecter</span>
        `;
        loginButton.classList.add('connected');
        loginButton.onclick = logout;
        
        const role = localStorage.getItem('userRole');
        if (role) {
            updateNavigation(role);
        }
    } else {
        loginButton.innerHTML = 'Se connecter';
        loginButton.classList.remove('connected');
        loginButton.onclick = showInitialRoleModal;
        document.querySelector('.dashboard-link')?.classList.add('hidden');
    }
}