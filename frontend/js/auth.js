const clientId = "BNQSfZeXcErHErBPe8BhKTYHO29XecKhlEmTO9JbgtlLXqi5b_D6MyVWoF2WsyS9sAmijqSDPYcptaQg-3zMVJo"; // Remplacez par votre client ID Web3Auth

const web3auth = new window.Web3Auth.Web3Auth({
    clientId,
    web3AuthNetwork: "sapphire_mainnet",
    chainConfig: {
        chainNamespace: "other",
        chainId: "0x2",
        rpcTarget: "https://testnet-ripple-node.tor.us",
        wsTarget: "wss://s.altnet.rippletest.net",
        ticker: "XRP",
        tickerName: "XRPL",
        displayName: "xrpl testnet",
        blockExplorerUrl: "https://testnet.xrpl.org",
    }
});

const privateKeyProvider = new window.Web3Auth.XrplPrivateKeyProvider({
    config: web3auth.chainConfig
});

// Initialisation de Web3Auth
async function initWeb3Auth() {
    try {
        await web3auth.initModal();
        console.log("Web3Auth initialized");
    } catch (error) {
        console.error("Error initializing Web3Auth:", error);
    }
}

// Fonction de connexion
async function login() {
    try {
        const provider = await web3auth.connect();
        const user = await web3auth.getUserInfo();
        console.log("User logged in:", user);
        document.getElementById('login-button').textContent = 'Connecté';
    } catch (error) {
        console.error("Error logging in:", error);
    }
}

// Écouteur d'événement pour le bouton de connexion
document.getElementById('login-button').addEventListener('click', login);

// Initialiser Web3Auth au chargement de la page
window.addEventListener('load', initWeb3Auth); 