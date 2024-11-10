import { Client, Wallet } from "xrpl";

// Configuration du client testnet
const client = new Client("wss://s.altnet.rippletest.net:51233");

// Fonction pour créer et financer un nouveau wallet
async function createAndFundWallet() {
    try {
        await client.connect();
        const { wallet, balance } = await client.fundWallet();
        return { wallet, balance };
    } catch (error) {
        console.error("Erreur lors de la création du wallet:", error);
        throw error;
    }
}

// Fonction pour effectuer un paiement XRP
async function makeXRPPayment(senderWallet: Wallet, destinationAddress: string, amount: string) {
    try {
        const payment = {
            TransactionType: "Payment",
            Account: senderWallet.classicAddress,
            Destination: destinationAddress,
            Amount: amount
        };

        const prepared = await client.autofill(payment);
        const signed = senderWallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);
        
        return result;
    } catch (error) {
        console.error("Erreur lors du paiement:", error);
        throw error;
    }
}

export { client, createAndFundWallet, makeXRPPayment }; 