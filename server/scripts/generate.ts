import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";
import { Account } from "../types";

export const generateAccounts = (num: number = 5): Account[] => {
    const accounts: Account[] = []

    for (let i = 0; i < num; i++) {
        const privKey = secp.utils.randomPrivateKey();
        const pubKey = secp.getPublicKey(privKey);
    
        const acc: Account = {
            privatekey: toHex(privKey),
            publickey: toHex(pubKey),
            balance: (i + 1) * (100)
        }
        accounts.push(acc)
    }
    return accounts
}