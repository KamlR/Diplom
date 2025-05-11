import { ethers } from 'ethers'
import { getUserOpHash } from '@account-abstraction/utils'
import fs from 'fs'
import Worker from '../../../database/src/models/worker'

export async function formUserOperation() {
  const workers = await Worker.find({}, 'walletAddress salary')
  const addresses = workers.map(worker => worker.walletAddress)
  const salaries = workers.map(worker => ethers.parseUnits(worker.salary.toString(), 18))
  const paySalaryFunctionSignature = 'paySalary(address[],uint256[])'
  const iface = new ethers.Interface([`function ${paySalaryFunctionSignature}`])
  const callData = iface.encodeFunctionData('paySalary', [addresses, salaries])

  const userOp = {
    sender: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
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

  const entryPointAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  const chainId = 1337

  const userOpHash = getUserOpHash(userOp, entryPointAddress, chainId)
  const data = { userOp, userOpHash }
  fs.writeFileSync('userOpData.json', JSON.stringify(data, null, 2), 'utf-8')
}
