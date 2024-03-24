
// import logger
import { logger } from './logger';


class Account {
  private accountId: string;
  private accumulatedBalance: number;

  constructor(accountId: string, accumulatedBalance: number) {
    this.accountId = accountId;
    this.accumulatedBalance = accumulatedBalance;
  }

  getAccountId(): string {
    return this.accountId;
  }

  getAccumulatedBalance(): number {
    return this.accumulatedBalance;
  }

  setAccumulatedBalance(accumulatedBalance: number): void {
    this.accumulatedBalance = accumulatedBalance;
  }
}

/*
  SalaryInformation class with the following properties:
    - accountId: string
    - salary: number
    - rate: number
    - payment_type (monthly or hourly): enum
*/
enum PaymentType {
  MONTHLY = 'monthly',
  DAILY = 'daily',
}

class SalaryInformation {
  accountId: string;
  salary: number;
  rate: number;
  payment_type: PaymentType;
  constructor(
    accountId: string,
    salary: number,
    rate: number,
    payment_type: PaymentType,
  ) {
    this.accountId = accountId;
    this.salary = salary;
    this.rate = rate;
    this.payment_type = payment_type;
  }
}

// SalaryCalculator interface with the following method: calculateDailySalary method that takes a
// SalaryInformation object and returns a number.
interface SalaryCalculator {
  calculateDailySalary(salary: SalaryInformation): number;
}

/*
    MonthlySalaryCalculator that implements the Salary interface for Monthly Payment type
*/
class MonthlySalaryCalculator implements SalaryCalculator {
  day: Date;
  constructor(day?: Date) {
    // init day, if not set, use today
    this.day = day || new Date();
  }
  calculateDailySalary(salary: SalaryInformation): number {
    const date = new Date(this.day);
    const month = date.getMonth();
    const year = date.getFullYear();
    logger.debug("date = " + date);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    logger.debug(`Days in month: ${daysInMonth}`);
    return salary.salary / daysInMonth;
  }
}

/*
    DailySalaryCalculator that implements the Salary interface for Monthly Payment type
*/
class DailySalaryCalculator implements SalaryCalculator {
  calculateDailySalary(salary: SalaryInformation): number {
    return salary.salary;
  }
}

// export module
export {
  Account,
  SalaryInformation,
  PaymentType,
  SalaryCalculator,
  MonthlySalaryCalculator,
  DailySalaryCalculator,
};
