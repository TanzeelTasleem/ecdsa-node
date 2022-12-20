import { Request } from "express"

export interface Account {
  publickey: string
  privatekey: string
  balance: number
}


export interface SenderRequest extends Request {
    body: {
      signature: string
      msgHash: string
      recoveryBit:number
      amountToTransfer:number
      recipentAddress:string
    }
  }