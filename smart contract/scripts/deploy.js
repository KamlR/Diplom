async function main() {
  // Получаем доступ к сети
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)
  const CryptoPayments = await ethers.getContractFactory('CryptoPayments')
  const EntryPoint = await ethers.getContractFactory('EntryPoint')

  const walletAddresses = ['0x8dE3f843ADBCaBbc50a8fDFEa84499c2842d9641'] // Добавь нужные адреса
  const roles = ['admin'] // Соответствующие роли

  const cryptoPayments = await CryptoPayments.deploy(
    walletAddresses,
    roles,
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  )
  const entryPoint = await EntryPoint.deploy()
  console.log('CryptoPayments contract deployed to:', cryptoPayments.target)
  console.log('EntryPoint deployed to:', entryPoint.target)

  // const tx = await deployer.sendTransaction({
  //   to: await cryptoPayments.target,
  //   value: ethers.parseEther('1000')
  // })
  //await tx.wait()
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
