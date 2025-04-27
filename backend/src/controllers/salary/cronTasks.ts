import cron from 'node-cron'
import { ScheduledTask } from 'node-cron'
import { formUserOperation } from '../salary/formUserOperation'
import { sendMessages } from './telegram'

let payrollCronJob: ScheduledTask | null = null
let allertingCronJob: ScheduledTask | null = null

export function startPayrollJob(schedule: string) {
  if (payrollCronJob) {
    payrollCronJob.stop()
  }

  payrollCronJob = cron.schedule(schedule, async () => {
    await formUserOperation()
    const message = '📢 Пожалуйста, подпишите выплаты зарплат.'
    await sendMessages(message, { role: 'accountant' })
  })
}

export function startAllertinJob(schedule: string) {
  if (allertingCronJob) {
    allertingCronJob.stop()
  }

  cron.schedule(schedule, async () => {
    const message =
      '📢 Через 2 дня будет производиться выплата зарплат. Внесети все необходимые изменения до 30 числа. В день выплаты зарплат изменения не возможны.'
    sendMessages(message, {})
  })
}
