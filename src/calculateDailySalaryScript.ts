import { calculateDailySalariesAllAcount } from './services/salaryCalculator';

// as script will be run by a cron job at midnight, we need to calculate the salaries for the previous day
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
calculateDailySalariesAllAcount(yesterday);
