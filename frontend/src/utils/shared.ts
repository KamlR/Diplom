import axios from 'axios'
import { NavigateFunction } from 'react-router-dom'
import { ethers } from 'ethers'
import { keccak256, AbiCoder } from 'ethers'

export async function workWithTokens(error: any, navigate: NavigateFunction) {
  if (error.response.data.error === 'The authorization token is invalid') {
    navigate('/authorization1')
    return false
  } else {
    try {
      const response = await axios.get('http://localhost:5001/tokens/refresh', {
        withCredentials: true
      })
      if (response.status == 200) {
        const { accessToken } = await response.data
        console.log(accessToken)
        localStorage.setItem('access_token', accessToken)
        return true
      }
    } catch (error: any) {
      navigate('/authorization1')
      return false
    }
  }
}

export async function getRole(navigate: NavigateFunction): Promise<string | null> {
  const accessToken = localStorage.getItem('access_token')
  try {
    const response = await axios.get('http://localhost:5001/workers_crm/role', {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    if (response.status == 200) {
      return response.data.role
    }
  } catch (error: any) {
    if (error?.response?.status === 401) {
      if (await workWithTokens(error, navigate)) {
        return await getRole(navigate)
      }
    } else {
      navigate('/authorization1')
    }
  }
  return null
}

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

export function checkData(
  value: string,
  regex: RegExp,
  type: string,
  setValidData: (valid: boolean) => void,
  setBorderStyle: (style: React.CSSProperties) => void,
  setButtonStyle: (style: React.CSSProperties) => void = () => {}
) {
  if (value == '') {
    setValidData(false)
    setNeutralBorderColor(type, setBorderStyle)
    setButtonStyle({ backgroundColor: '#b3c9e2' })
    return
  }
  const isValid = regex.test(value)
  if (!isValid) {
    setValidData(false)
    setBorderStyle({ border: '2px solid rgb(226, 68, 56)' })
    setButtonStyle({ backgroundColor: '#b3c9e2' })
  } else {
    setValidData(true)
    setNeutralBorderColor(type, setBorderStyle)
    setButtonStyle({ backgroundColor: '#4A90E2' })
  }
}

function setNeutralBorderColor(
  type: string,
  setBorderStyle: (style: React.CSSProperties) => void
) {
  if (type == 'give_access' || type == 'employee') {
    setBorderStyle({ border: '1px solid #dddddd' })
  } else {
    setBorderStyle({ border: '2px solid #4A90E2' })
  }
}
