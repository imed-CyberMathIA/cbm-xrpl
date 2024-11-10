const clientId = "BNQSfZeXcErHErBPe8BhKTYHO29XecKhlEmTO9JbgtlLXqi5b_D6MyVWoF2WsyS9sAmijqSDPYcptaQg-3zMVJo";

let web3auth = null;

async function initWeb3Auth() {
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
        
        // Déconnexion automatique au chargement
        if (await web3auth.connected) {
            await logout();
        }
        
        console.log("Web3Auth initialized successfully");
    } catch (error) {
        console.error("Error initializing Web3Auth:", error);
    }
}

async function updateLoginButton(user = null) {
    const loginButton = document.getElementById('login-button');
    if (user) {
        // Utilisateur connecté
        loginButton.innerHTML = `
            <span class="user-info">${user.email || user.name || 'Utilisateur'}</span>
            <span>Se déconnecter</span>
        `;
        loginButton.classList.add('connected');
        loginButton.onclick = logout;
    } else {
        // Utilisateur déconnecté
        loginButton.innerHTML = 'Se connecter';
        loginButton.classList.remove('connected');
        loginButton.onclick = login;
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
            console.log("User logged in:", user);
            await updateLoginButton(user);
        }
    } catch (error) {
        console.error("Error logging in:", error);
    }
}

async function logout() {
    if (!web3auth) {
        console.log("Web3Auth not initialized");
        return;
    }
    try {
        await web3auth.logout();
        console.log("Logged out");
        await updateLoginButton();
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