const clientId = "BNQSfZeXcErHErBPe8BhKTYHO29XecKhlEmTO9JbgtlLXqi5b_D6MyVWoF2WsyS9sAmijqSDPYcptaQg-3zMVJo";
const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");

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
            updateLoginButton(user);
            console.log("Session restaurée pour:", user);
        }
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
            document.getElementById('auth-required').style.display = 'none';
            document.getElementById('courses-content').classList.remove('hidden');
        }
    } else {
        loginButton.innerHTML = 'Se connecter';
        loginButton.classList.remove('connected');
        loginButton.onclick = login;
        
        if (window.location.pathname.includes('cours.html')) {
            document.getElementById('auth-required').style.display = 'block';
            document.getElementById('courses-content').classList.add('hidden');
        }
    }
}

async function login() {
    try {
        const provider = await window.web3auth.connect();
        if (provider) {
            const user = await window.web3auth.getUserInfo();
            updateLoginButton(user);
        }
    } catch (error) {
        console.error("Error logging in:", error);
    }
}

async function logout() {
    try {
        await window.web3auth.logout();
        updateLoginButton(null);
    } catch (error) {
        console.error("Error logging out:", error);
    }
}

async function handleCoursePayment(coursePrice, courseName) {
    if (!window.web3auth?.connected) {
        alert("Veuillez vous connecter pour accéder à cette formation");
        return false;
    }

    try {
        await client.connect();

        // Créer un compte pour le paiement
        const fundResult = await client.fundWallet();
        const senderWallet = fundResult.wallet;
        
        // Préparer la transaction
        const tx = {
            TransactionType: "Payment",
            Account: senderWallet.classicAddress,
            Destination: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe", // Adresse de destination fixe
            Amount: xrpl.xrpToDrops(coursePrice.toString())
        };

        // Soumettre la transaction
        const prepared = await client.autofill(tx);
        const signed = senderWallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);

        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            alert(`
                Paiement réussi !
                Montant: ${coursePrice} XRP
                Hash de transaction: ${result.result.hash}
                Vérifier sur: https://testnet.xrpl.org/transactions/${result.result.hash}
            `);
            return true;
        }

        await client.disconnect();
        return false;
    } catch (error) {
        console.error("Erreur lors du paiement:", error);
        alert("Une erreur est survenue lors du paiement");
        return false;
    }
}

window.addEventListener('load', () => {
    initWeb3Auth().catch(console.error);
});

// Rendre les fonctions accessibles globalement
window.login = login;
window.logout = logout;
window.handleCoursePayment = handleCoursePayment;