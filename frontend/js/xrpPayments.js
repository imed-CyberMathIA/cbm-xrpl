import { Client, Wallet } from "xrpl";

const serverURL = "wss://s.altnet.rippletest.net:51233";
const client = new Client(serverURL);

// Fonction pour créer et financer un wallet
export async function createAndFundWallet() {
    try {
        await client.connect();
        const { wallet, balance } = await client.fundWallet();
        console.log("Nouveau wallet créé:", wallet.classicAddress);
        console.log("Balance initiale:", balance);
        return { wallet, balance };
    } catch (error) {
        console.error("Erreur lors de la création du wallet:", error);
        throw error;
    }
}

// Fonction pour effectuer un paiement
export async function makePayment(senderWallet, receiverAddress, amount) {
    try {
        const tx = {
            TransactionType: "Payment",
            Account: senderWallet.classicAddress,
            Destination: receiverAddress,
            Amount: amount.toString(),
            Memos: [{
                Memo: {
                    MemoType: Buffer.from("Description").toString("hex").toUpperCase(),
                    MemoData: Buffer.from("Paiement formation CyberMathIA").toString("hex").toUpperCase()
                }
            }]
        };

        const prepared = await client.autofill(tx);
        const signed = senderWallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);
        
        return result;
    } catch (error) {
        console.error("Erreur lors du paiement:", error);
        throw error;
    }
}

// Fonction pour vérifier le solde
export async function checkBalance(address) {
    try {
        const balance = await client.getXrpBalance(address);
        return balance;
    } catch (error) {
        console.error("Erreur lors de la vérification du solde:", error);
        throw error;
    }
}

// Fonction pour écouter les transactions
export async function listenToTransactions(address) {
    try {
        const request = {
            command: 'subscribe',
            accounts: [address]
        };

        await client.request(request);
        console.log(`Abonné aux transactions pour: ${address}`);

        client.on('transaction', (transaction) => {
            console.log('Transaction détectée:', transaction);
            // Mettre à jour l'interface utilisateur ici
            if (typeof updateTransactionUI === 'function') {
                updateTransactionUI(transaction);
            }
        });
    } catch (error) {
        console.error("Erreur lors de l'écoute des transactions:", error);
    }
} 