
// import logger
import { logger } from './logger';
import { Decimal } from 'decimal.js';
Decimal.set({ rounding: Decimal.ROUND_HALF_EVEN })

class Account {
  private accountId: string;
  private balance: Decimal;

  constructor(accountId: string, balance: Decimal) {
    this.accountId = accountId;
    this.balance = balance;
  }

  getAccountId(): string {
    return this.accountId;
  }

  getAccumulatedBalance(): Decimal {
    return this.balance;
  }

  setAccumulatedBalance(balance: Decimal): void {
    this.balance = balance;
  }
}

/*
  SalaryInformation class with the following properties:
    - accountId: string
    - salary: number
    - rate: number
    - payment_type (monthly or hourly):
*/

class SalaryInformation {
  accountId: string;
  salary: Decimal;
  payFrequency: string;
  constructor(
    accountId: string,
    salary: Decimal,
    payFrequency: string,
  ) {
    this.accountId = accountId;
    this.salary = salary;
    this.payFrequency = payFrequency;
  }
}

// SalaryCalculator interface with the following method: calculateDailySalary method that takes a
// SalaryInformation object and returns a number.
interface SalaryCalculator {
  calculateDailySalary(salary: SalaryInformation): Decimal;
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
  calculateDailySalary(salary: SalaryInformation): Decimal {
    const date = new Date(this.day);
    const month = date.getMonth();
    const year = date.getFullYear();
    logger.debug("date = " + date);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    logger.debug(`Days in month: ${daysInMonth}`);
    // round to 2 decimal places using Decimal.ROUND_HALF_EVEN
    return salary.salary.div(daysInMonth).toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
  }
}

/*
    DailySalaryCalculator that implements the Salary interface for Monthly Payment type
*/
class DailySalaryCalculator implements SalaryCalculator {
  calculateDailySalary(salary: SalaryInformation): Decimal {
    return salary.salary;
  }
}

// export module
export {
  Account,
  SalaryInformation,
  SalaryCalculator,
  MonthlySalaryCalculator,
  DailySalaryCalculator,
};
