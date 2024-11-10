import { Client, Payment, xrpToDrops } from "xrpl";

async function processXRPPayment({ 
  senderWallet, 
  receiverAddress, 
  amount, 
  client 
}: any) {
  const payment: Payment = {
    TransactionType: "Payment",
    Account: senderWallet.classicAddress,
    Destination: receiverAddress,
    Amount: xrpToDrops(amount.toString())
  };

  const result = await client.submitAndWait(payment, {
    autofill: true,
    wallet: senderWallet,
  });

  return result;
}

// Fonction pour récompenser l'utilisateur avec des tokens CBM
async function rewardUserWithCBM({
  issuerWallet,
  userWallet,
  amount,
  client
}: any) {
  try {
    const result = await createCBMToken({
      issuer: issuerWallet,
      receiver: userWallet,
      client,
      amount
    });
    return result;
  } catch (error) {
    console.error("Erreur lors de la récompense CBM:", error);
    throw error;
  }
}

export { processXRPPayment, rewardUserWithCBM }; 