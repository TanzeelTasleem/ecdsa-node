import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  theme,
  HStack,
  Select,
  Button,
  Input,
  Stack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import axios, { AxiosError, AxiosResponse } from "axios"
import { TransferResponse, Account } from './types/types'
import { toHex, utf8ToBytes } from 'ethereum-cryptography/utils'
import { keccak256 } from 'ethereum-cryptography/keccak'
import * as secp from 'ethereum-cryptography/secp256k1'

export const App = () => {
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [balance, setBalance] = React.useState<number | undefined>()
  const [fAddress, setFAddress] = React.useState<string>("")
  const [toAddress, setToAddress] = React.useState<string>("")
  const [amountToSend, setAmountToSend] = React.useState<number>(0)
  const [isError, setIsError] = React.useState<any>("");
  function hashMessage(message: any) {
    const bytes = utf8ToBytes(message.toString());
    const hash = keccak256(bytes);
    return hash;
  }


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value !== "") {
      const acc = accounts.filter((a) => a.publickey == e.target.value)
      setBalance(acc[0].balance)
      setFAddress(e.target.value)
    } else {
      setBalance(undefined)
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsError("")
    try {

      if (fAddress == toAddress) {
        throw new Error("address cannot be same !!!");
      }
      const msgHash = hashMessage(balance);
      const acc = accounts.filter((a) => a.publickey === fAddress)
      const signature = await secp.sign(msgHash, acc[0].privatekey, { recovered: true });
      const [sig, recoveryBit] = signature

      const result = await axios.post<any, AxiosResponse<TransferResponse>>("http://localhost:5000/send", {
        signature: toHex(sig),
        recoveryBit: recoveryBit,
        msgHash: toHex(msgHash),
        recipentAddress: toAddress,
        amountToTransfer: amountToSend
      })
      const { sender, recipent, recoverd } = result.data
      const _sIndex = accounts.findIndex((a) => a.publickey === sender.publickey)
      const _rIndex = accounts.findIndex((a) => a.publickey === recipent.publickey)
      const temp: Account[] = accounts;
      temp[_sIndex] = { ...temp[_sIndex], balance: sender.balance }
      temp[_rIndex] = { ...temp[_rIndex], balance: recipent.balance }
      setAccounts(temp);
      setBalance(sender.balance);
      setAmountToSend(0);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError
        setIsError(err.response?.data)
      }
      setIsError(error.message)
    }

  }

  React.useEffect(() => {
    (async () => {
      const result = await axios.get<any, AxiosResponse<Account[]>>("http://localhost:5000/getAccounts")
      setAccounts(result.data)
    })()
  }, [])


  return (
    <ChakraProvider theme={theme}>
      <Box fontSize="xl">
        <Box minH="100vh" p={3}>
          <ColorModeSwitcher float="right" justifyContent="center" />
          <br />
          <VStack>
            <Text textTransform="capitalize" colorScheme="blackAlpha" fontWeight="bold">
              transfer funds from any account to another account
            </Text>
          </VStack>

          <HStack justifyContent="center" mt="10" >
            <Box _dark={{ color: "white" }} border="1px" borderColor="gray.200" boxShadow="0 0 0 1.5px" shadow="0px 1px 3px 3px" color="gray.200" p={5} flex="0.7" borderRadius="2xl">
              <Stack _dark={{ color: "white" }} color="black" spacing="4">
                {/* <Text textAlign="center" p="2">Sent To Account</Text> */}
                <form onSubmit={handleSubmit} >
                  <FormControl isRequired>
                    <FormLabel>From Address</FormLabel>
                    <Select onChange={handleChange} _dark={{ color: "white", borderColor: "gray.200" }} placeholder='Select An Account' border="2px" focusBorderColor="blackAlpha" color="black" borderColor="black" _hover={{ borderColor: "gray.600" }}>
                      {accounts.map((acc, index) => (
                        <option key={acc.balance * index + 1} value={acc.publickey}>{acc.publickey}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl mt="3" mb="2.5" isReadOnly>
                    <FormLabel>Balance</FormLabel>
                    <Input readOnly _dark={{ color: "white", borderColor: "gray.200", _placeholder: { color: "white" } }} border="2px" borderColor="black" color="black" _hover={{ borderColor: "gray.600" }} _placeholder={{ color: "black" }} focusBorderColor="blackAlpha" variant='outline' placeholder='Balance of Account' value={balance ? balance : ""} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>To Address</FormLabel>
                    <Select onChange={(e) => { setToAddress(e.target.value) }} _dark={{ color: "white", borderColor: "gray.200" }} placeholder='Select An Account' border="2px" focusBorderColor="blackAlpha" color="black" borderColor="black" _hover={{ borderColor: "gray.600" }}>
                      {accounts.map((acc, index) => (
                        <option key={acc.balance * index} value={acc.publickey}>{acc.publickey}...</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl mt="3" mb="2.5" isRequired>
                    <FormLabel>Amount to Send:</FormLabel>
                    <Input onChange={(e) => { setAmountToSend(Number(e.target.value)) }} _dark={{ color: "white", borderColor: "gray.200", _placeholder: { color: "white" } }} border="2px" borderColor="black" color="black" _hover={{ borderColor: "gray.600" }} _placeholder={{ color: "black" }} focusBorderColor="blackAlpha" variant='outline' placeholder='Balance of Account' value={amountToSend} />
                  </FormControl>

                  <Button type="submit" _dark={{ color: "white", borderColor: "gray.200", _hover: { color: "black", bg: "white" } }} borderColor="black" variant="outline" _hover={{ color: "white", bg: "black" }} border="2px" mt="5" w="full" color="black"> Transfer</Button>
                </form>
              </Stack>
              {
                isError && <Text _dark={{ color: "white" }} color="red.400" fontWeight="semibold" textAlign="center" p="2" textTransform="capitalize">{isError}</Text>
              }
            </Box>
          </HStack>

        </Box>
      </Box>
    </ChakraProvider>
  )
}
