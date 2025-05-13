import cron from 'node-cron'
import { ScheduledTask } from 'node-cron'
import { formUserOperation } from '../blockchain/formUserOperation'
import { sendMessages } from '../telegram/telegram'

let payrollCronJob: ScheduledTask | null = null
let allertingCronJob: ScheduledTask | null = null

// TODO: можно делать рассылку о том, что дата выплат изменилась
export function startPayrollJob(schedule: string) {
  if (payrollCronJob) {
    payrollCronJob.stop()
  }
  payrollCronJob = cron.schedule(
    schedule,
    async () => {
      await formUserOperation()
      const message = '📢 Пожалуйста, подпишите выплаты зарплат.'
      await sendMessages(message, { role: 'accountant' })
    },
    {
      timezone: 'UTC'
    }
  )
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
