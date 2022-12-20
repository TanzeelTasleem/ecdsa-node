export interface Account {
    publickey: string
    privatekey: string
    balance: number
}


export interface TransferResponse {
    sender: Account, 
    recipent: Account, 
    recoverd: boolean
}