import { ethers } from 'ethers'
import { keccak256, AbiCoder } from 'ethers'

export function formUserOperation(walletAddress: string, role: string): any {
  const giveAccessToEmployeeFunctionSignature = 'giveAccessToEmployee(address,string)'
  const iface = new ethers.Interface([
    `function ${giveAccessToEmployeeFunctionSignature}`
  ])
  const callData = iface.encodeFunctionData('giveAccessToEmployee', [walletAddress, role])
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
    signature: ''
  }
  const entryPointAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  const chainId = 1337

  const abi = AbiCoder.defaultAbiCoder()
  const userOpPackHash = keccak256(
    abi.encode(
      [
        'address',
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'bytes32'
      ],
      [
        userOp.sender,
        userOp.nonce,
        keccak256(userOp.initCode),
        keccak256(userOp.callData),
        userOp.callGasLimit,
        userOp.verificationGasLimit,
        userOp.preVerificationGas,
        userOp.maxFeePerGas,
        userOp.maxPriorityFeePerGas,
        keccak256(userOp.paymasterAndData)
      ]
    )
  )

  const finalHash = keccak256(
    abi.encode(
      ['bytes32', 'address', 'uint256'],
      [userOpPackHash, entryPointAddress, chainId]
    )
  )

  return { userOp, userOpHash: finalHash }
}
