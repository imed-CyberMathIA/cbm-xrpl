import { Client, Wallet, xrpToDrops } from "xrpl";

export async function createAndFundWallet(client) {
    try {
        const fundResult = await client.fundWallet();
        return fundResult;
    } catch (error) {
        console.error("Erreur lors de la création du wallet:", error);
        throw error;
    }
}

export async function makeXRPPayment(senderWallet, destinationAddress, amount, client) {
    try {
        const payment = {
            TransactionType: "Payment",
            Account: senderWallet.classicAddress,
            Destination: destinationAddress,
            Amount: xrpToDrops(amount.toString())
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