export default class Worker {
  id: string
  firstName: string
  lastName: string
  salary: number
  walletAddress: string
  position: string
  department: string

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    salary: number,
    walletAddress: string,
    position: string,
    department: string
  ) {
    this.id = id
    this.firstName = firstName
    this.lastName = lastName
    this.salary = salary
    this.walletAddress = walletAddress
    this.position = position
    this.department = department
  }
}
