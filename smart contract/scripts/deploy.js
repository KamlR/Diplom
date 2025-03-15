async function main() {
  // Получаем доступ к сети
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)
  const CryptoPayments = await ethers.getContractFactory('CryptoPayments')

  const walletAddresses = ['0x8dE3f843ADBCaBbc50a8fDFEa84499c2842d9641'] // Добавь нужные адреса
  const roles = ['admin'] // Соответствующие роли

  const cryptoPayments = await CryptoPayments.deploy(walletAddresses, roles)
  console.log('CryptoPayments contract deployed to:', cryptoPayments.target)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
