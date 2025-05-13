import { ethers } from 'ethers'
import { keccak256, AbiCoder } from 'ethers'

const { REACT_APP_SMART_CONTRACT_ADDRESS, REACT_APP_ENTRYPOINT_ADDRESS, REACT_APP_CHAIN_ID } =
  process.env

export function formUserOperation(walletAddress: string, role: string): any {
  const giveAccessToEmployeeFunctionSignature = 'giveAccessToEmployee(address,string)'
  const iface = new ethers.Interface([`function ${giveAccessToEmployeeFunctionSignature}`])
  const callData = iface.encodeFunctionData('giveAccessToEmployee', [walletAddress, role])
  const userOp = {
    sender: REACT_APP_SMART_CONTRACT_ADDRESS,
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
      [userOpPackHash, REACT_APP_ENTRYPOINT_ADDRESS, REACT_APP_CHAIN_ID]
    )
  )

  return { userOp, userOpHash: finalHash }
}
