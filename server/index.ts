import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { generateAccounts } from './scripts/generate';
import cors from 'cors'
dotenv.config();
import { toHex } from 'ethereum-cryptography/utils'
import * as secp from 'ethereum-cryptography/secp256k1'
import bodyParser, { json } from 'body-parser';
import { SenderRequest } from './types';

const app: Express = express();
const port = process.env.PORT;
app.use(cors({
  origin: '*'
}));
app.use(bodyParser.json());

const accounts = generateAccounts(5);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/getAccounts', (req: Request, res: Response) => {
  res.send(accounts)
});

app.post('/send', (req: SenderRequest, res: Response) => {
  const { msgHash, signature, recoveryBit, amountToTransfer, recipentAddress } = req.body
  const recovered = secp.recoverPublicKey(msgHash, signature, recoveryBit)
  const _sIndex = accounts.findIndex((a) => a.publickey === toHex(recovered))
  const _rIndex = accounts.findIndex((a) => a.publickey == recipentAddress)
  if (_sIndex == -1) {
    res.status(400).send({ message: "signature is not valid!!" });
  }
  if (_rIndex == -1) {
    res.status(400).send({ message: "Recipent Address is not valid!!" });
  }
  if (accounts[_sIndex].balance < amountToTransfer) {
    res.status(400).send({ message: "double spending is not allowed!" });
  }
  accounts[_sIndex].balance = accounts[_sIndex].balance - amountToTransfer
  accounts[_rIndex].balance = accounts[_rIndex].balance + amountToTransfer
  res.send({ sender: accounts[_sIndex], recipent: accounts[_rIndex], recoverd: true })
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
