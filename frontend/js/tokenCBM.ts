import { TrustSet, AccountSet, AccountSetAsfFlags, TrustSetFlags } from "xrpl";
import { Payment } from "xrpl/src/models";

// Fonction utilitaire pour convertir le code du token
function convertStringToHexPadded(str: string): string {
  let hex: string = "";
  for (let i = 0; i < str.length; i++) {
    const hexChar: string = str.charCodeAt(i).toString(16);
    hex += hexChar;
  }
  const paddedHex: string = hex.padEnd(40, "0");
  return paddedHex.toUpperCase();
}

// Activer le rippling pour l'émetteur
async function enableRippling({ wallet, client }: any) {
  const accountSet: AccountSet = {
    TransactionType: "AccountSet",
    Account: wallet.address,
    SetFlag: AccountSetAsfFlags.asfDefaultRipple,
  };

  const prepared = await client.autofill(accountSet);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  console.log("Enable rippling tx: ", result.result.hash);
  return result;
}

// Créer et émettre les tokens CBM
async function createCBMToken({ issuer, receiver, client, amount }: any) {
  const tokenCode = convertStringToHexPadded("CBM");
  
  // Créer la ligne de confiance
  const trustSet: TrustSet = {
    TransactionType: "TrustSet",
    Account: receiver.address,
    LimitAmount: {
      currency: tokenCode,
      issuer: issuer.address,
      value: "1000000000", // 1B tokens max
    },
    Flags: TrustSetFlags.tfClearNoRipple,
  };

  // Receiver ouvre la ligne de confiance
  const preparedTrust = await client.autofill(trustSet);
  const signedTrust = receiver.sign(preparedTrust);
  const resultTrust = await client.submitAndWait(signedTrust.tx_blob);

  // Envoyer les tokens CBM au receiver
  const sendPayment: Payment = {
    TransactionType: "Payment",
    Account: issuer.address,
    Destination: receiver.address,
    Amount: {
      currency: tokenCode,
      issuer: issuer.address,
      value: amount.toString(),
    },
  };

  const preparedPayment = await client.autofill(sendPayment);
  const signedPayment = issuer.sign(preparedPayment);
  const resultPayment = await client.submitAndWait(signedPayment.tx_blob);

  return {
    trustSetHash: resultTrust.result.hash,
    paymentHash: resultPayment.result.hash
  };
}

export { enableRippling, createCBMToken }; 