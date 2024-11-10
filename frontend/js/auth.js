const clientId = "BNQSfZeXcErHErBPe8BhKTYHO29XecKhlEmTO9JbgtlLXqi5b_D6MyVWoF2WsyS9sAmijqSDPYcptaQg-3zMVJo";

// Rendre web3auth accessible globalement
window.web3auth = null;

async function initWeb3Auth() {
    try {
        window.web3auth = new window.Modal.Web3Auth({
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

        await window.web3auth.initModal();
        
        // Vérifier si l'utilisateur est déjà connecté
        if (await window.web3auth.connected) {
            const user = await window.web3auth.getUserInfo();
            await updateLoginButton(user);
            console.log("Session restaurée pour:", user);
        }
        
        console.log("Web3Auth initialized successfully");
    } catch (error) {
        console.error("Error initializing Web3Auth:", error);
    }
}

async function updateLoginButton(user = null) {
    const loginButton = document.getElementById('login-button');
    const dashboardLink = document.getElementById('dashboard-link');
    
    if (user) {
        loginButton.innerHTML = `
            <span class="user-info">${user.email || user.name || 'Utilisateur'}</span>
            <span>Se déconnecter</span>
        `;
        loginButton.classList.add('connected');
        loginButton.onclick = logout;
        
        // Mettre à jour l'accès aux cours si on est sur la page cours
        if (window.location.pathname.includes('cours.html')) {
            updateCoursesAccess(user);
        }
        
        dashboardLink.style.display = 'block'; // Afficher le lien dashboard
    } else {
        loginButton.innerHTML = 'Se connecter';
        loginButton.classList.remove('connected');
        loginButton.onclick = login;
        
        // Mettre à jour l'accès aux cours si on est sur la page cours
        if (window.location.pathname.includes('cours.html')) {
            updateCoursesAccess();
        }
        
        dashboardLink.style.display = 'none'; // Cacher le lien dashboard
    }
}

async function login() {
    if (!window.web3auth) {
        console.log("Web3Auth not initialized");
        return;
    }
    try {
        const provider = await window.web3auth.connect();
        if (provider) {
            const user = await window.web3auth.getUserInfo();
            console.log("User logged in:", user);
            await updateLoginButton(user);
        }
    } catch (error) {
        console.error("Error logging in:", error);
    }
}

async function logout() {
    if (!window.web3auth) {
        console.log("Web3Auth not initialized");
        return;
    }
    try {
        await window.web3auth.logout();
        console.log("Logged out");
        await updateLoginButton();
        
        // Rediriger vers la page d'accueil après la déconnexion
        if (window.location.pathname.includes('cours.html')) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error("Error logging out:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded");
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        console.log("Login button found");
        loginButton.addEventListener('click', login);
    } else {
        console.log("Login button not found");
    }
    
    initWeb3Auth().catch(console.error);
}); 