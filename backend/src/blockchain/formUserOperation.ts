import { ethers } from 'ethers'
import { getUserOpHash } from '@account-abstraction/utils'
import fs from 'fs'
import Worker from '../../database/src/models/worker'
import dotenv from 'dotenv'

dotenv.config({ path: './env/blockchain.env' })
const SMART_CONTRACT_ADDRESS: string = process.env.SMART_CONTRACT_ADDRESS as string
const ENTRYPOINT_ADDRESS: string = process.env.ENTRYPOINT_ADDRESS as string
const CHAIN_ID: string = process.env.CHAIN_ID as string

export async function formUserOperation() {
  const workers = await Worker.find({}, 'walletAddress salary')
  const addresses = workers.map(worker => worker.walletAddress)
  const salaries = workers.map(worker => ethers.parseUnits(worker.salary.toString(), 18))
  const paySalaryFunctionSignature = 'paySalary(address[],uint256[])'
  const iface = new ethers.Interface([`function ${paySalaryFunctionSignature}`])
  const callData = iface.encodeFunctionData('paySalary', [addresses, salaries])

  const userOp = {
    sender: SMART_CONTRACT_ADDRESS,
    nonce: 0,
    initCode: '0x',
    callData: callData,
    callGasLimit: 100000,
    verificationGasLimit: 100000,
    preVerificationGas: 21000,
    maxFeePerGas: ethers.parseUnits('10', 'gwei').toString(),
    maxPriorityFeePerGas: ethers.parseUnits('1', 'gwei').toString(),
    paymasterAndData: '0x',
    signature: '0x'
  }

  const userOpHash = getUserOpHash(userOp, ENTRYPOINT_ADDRESS, Number(CHAIN_ID))
  const data = { userOp, userOpHash }
  fs.writeFileSync('userOpData.json', JSON.stringify(data, null, 2), 'utf-8')
}
