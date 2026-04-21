import cron from 'node-cron'
import { Logger } from 'borgen'

const hourlySchedule = '0 * * * *' //every hour
const dailySchedule = '0 0 * * *' //every day at 12.00am
const weeklySchedule = '0 0 * * 1' // On Monday 12.00am
const monthlySchedule = '0 0 1 * *' // First day of the month
const yearlySchedule = '0 0 1 1 *' // New Year

const hourlyTask = async () => {
}

const dailyTask = async () => {

	Logger.info({
		message: 'Daily task is running',
	})
}

const monthlyTask = async () => {
}

const yearlyTask = async () => {
}

export const hourlyJob = cron.schedule(hourlySchedule, hourlyTask)
export const dailyJob = cron.schedule(dailySchedule, dailyTask)
export const monthlyJob = cron.schedule(monthlySchedule, monthlyTask)
export const yearlyJob = cron.schedule(yearlySchedule, yearlyTask)
