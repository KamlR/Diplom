import fs from 'fs'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)
  const CryptoPayments = await ethers.getContractFactory('CryptoPayments')
  const EntryPoint = await ethers.getContractFactory('EntryPoint')

  const walletAddresses = ['0x8dE3f843ADBCaBbc50a8fDFEa84499c2842d9641']
  const roles = ['admin']

  const entryPoint = await EntryPoint.deploy()
  const cryptoPayments = await CryptoPayments.deploy(walletAddresses, roles, entryPoint.target)

  //   const frontendEnv = `REACT_APP_ENTRYPOINT_ADDRESS=${entryPoint.target}
  // REACT_APP_SMART_CONTRACT_ADDRESS=${cryptoPayments.target}
  // `

  //   const backendEnv = `ENTRYPOINT_ADDRESS=${entryPoint.target}
  // SMART_CONTRACT_ADDRESS=${cryptoPayments.target}
  // `

  //   fs.writeFileSync('/shared/frontend.env', frontendEnv)
  //   fs.writeFileSync('/shared/backend.env', backendEnv)

  console.log('✅ Contracts deployed. Env files written.')

  console.log('CryptoPayments contract deployed to:', cryptoPayments.target)
  console.log('EntryPoint deployed to:', entryPoint.target)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
