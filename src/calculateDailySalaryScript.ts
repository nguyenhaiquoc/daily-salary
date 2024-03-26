import { calculateDailySalariesAllAcount } from './services/salaryCalculator';
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
calculateDailySalariesAllAcount(yesterday);
