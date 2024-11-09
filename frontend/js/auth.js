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
            },
            uiConfig: {
                theme: "light",
                loginMethodsOrder: ["google", "facebook"]
            }
        });

        await web3auth.initModal();
        
        if (await web3auth.connected) {
            const user = await web3auth.getUserInfo();
            document.getElementById('login-button').textContent = 'Connecté';
            console.log("User already logged in:", user);
        }
        console.log("Web3Auth initialized successfully");
    } catch (error) {
        console.error("Error initializing Web3Auth:", error);
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
            document.getElementById('login-button').textContent = 'Connecté';
        }
    } catch (error) {
        console.error("Error logging in:", error);
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