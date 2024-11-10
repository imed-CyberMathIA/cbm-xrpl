const clientId = "BNQSfZeXcErHErBPe8BhKTYHO29XecKhlEmTO9JbgtlLXqi5b_D6MyVWoF2WsyS9sAmijqSDPYcptaQg-3zMVJo";
let platformWallet = null;
let xrplClient = null;

// Rendre web3auth accessible globalement
window.web3auth = null;

async function initWeb3Auth() {
    try {
        // Attendre que xrpl soit disponible
        if (typeof xrpl === 'undefined') {
            console.error("XRPL library not loaded");
            return;
        }

        window.web3auth = new window.Modal.Web3Auth({
            clientId,
            web3AuthNetwork: "sapphire_mainnet",
            chainConfig: {
                chainNamespace: "other",
                chainId: "0x1",
                rpcTarget: "wss://s.altnet.rippletest.net:51233",
                displayName: "XRPL Testnet",
                blockExplorer: "https://testnet.xrpl.org",
                ticker: "XRP",
                tickerName: "XRP"
            }
        });

        await window.web3auth.initModal();
        
        if (await window.web3auth.connected) {
            const user = await window.web3auth.getUserInfo();
            await updateLoginButton(user);
            console.log("Session restaurée pour:", user);
        }
        
        // Initialiser le client XRPL
        xrplClient = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        
        console.log("Web3Auth initialized successfully");
    } catch (error) {
        console.error("Error initializing Web3Auth:", error);
    }
}

async function updateLoginButton(user = null) {
    const loginButton = document.getElementById('login-button');
    
    if (user) {
        loginButton.innerHTML = `
            <span class="user-info">${user.email || user.name || 'Utilisateur'}</span>
            <span>Se déconnecter</span>
        `;
        loginButton.classList.add('connected');
        loginButton.onclick = logout;
        
        if (window.location.pathname.includes('cours.html')) {
            const authRequired = document.getElementById('auth-required');
            const coursesContent = document.getElementById('courses-content');
            if (authRequired && coursesContent) {
                authRequired.style.display = 'none';
                coursesContent.classList.remove('hidden');
            }
        }
    } else {
        loginButton.innerHTML = 'Se connecter';
        loginButton.classList.remove('connected');
        loginButton.onclick = login;
        
        if (window.location.pathname.includes('cours.html')) {
            const authRequired = document.getElementById('auth-required');
            const coursesContent = document.getElementById('courses-content');
            if (authRequired && coursesContent) {
                authRequired.style.display = 'block';
                coursesContent.classList.add('hidden');
            }
        }
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
        
        if (window.location.pathname.includes('cours.html')) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error("Error logging out:", error);
    }
}

// Fonction de paiement mise à jour
async function handleCoursePayment(coursePrice, courseName) {
    if (!window.web3auth?.connected) {
        alert("Veuillez vous connecter pour accéder à cette formation");
        return false;
    }

    try {
        await xrplClient.connect();
        
        // Création du wallet utilisateur
        const { wallet: userWallet } = await xrplClient.fundWallet();
        console.log("Wallet utilisateur créé:", userWallet.classicAddress);

        // Création du wallet plateforme si nécessaire
        if (!platformWallet) {
            const { wallet } = await xrplClient.fundWallet();
            platformWallet = wallet;
            console.log("Wallet plateforme créé:", platformWallet.classicAddress);
        }

        // Effectuer le paiement
        const payment = {
            TransactionType: "Payment",
            Account: userWallet.classicAddress,
            Destination: platformWallet.classicAddress,
            Amount: xrpl.xrpToDrops(coursePrice.toString())
        };

        const prepared = await xrplClient.autofill(payment);
        const signed = userWallet.sign(prepared);
        const result = await xrplClient.submitAndWait(signed.tx_blob);

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            alert(`Paiement de ${coursePrice} XRP réussi !
                  \nHash de transaction: ${result.result.hash}
                  \nVous pouvez vérifier la transaction sur: https://testnet.xrpl.org/transactions/${result.result.hash}`);
            
            const userBalance = await xrplClient.getXrpBalance(userWallet.classicAddress);
            const platformBalance = await xrplClient.getXrpBalance(platformWallet.classicAddress);
            
            console.log(`Solde utilisateur: ${userBalance} XRP`);
            console.log(`Solde plateforme: ${platformBalance} XRP`);
            
            return true;
        }

        await xrplClient.disconnect();
        return false;
    } catch (error) {
        console.error("Erreur lors du paiement:", error);
        alert("Une erreur est survenue lors du paiement");
        return false;
    }
}

// Attendre que le DOM et les scripts soient chargés
window.addEventListener('load', () => {
    console.log("Window loaded");
    if (typeof xrpl === 'undefined') {
        console.error("XRPL library not loaded");
        return;
    }
    initWeb3Auth().catch(console.error);
});

// Rendre les fonctions accessibles globalement
window.login = login;
window.logout = logout;
window.handleCoursePayment = handleCoursePayment;