// import logger
import { MONTHLY } from '../const';
import AccountRepository from '../repositories/account';
import { logger } from '../logger';
import { Decimal } from 'decimal.js';
Decimal.set({ rounding: Decimal.ROUND_HALF_EVEN });

class Account {
  private accountId: string;
  private balance: Decimal;
  private salary: SalaryInformation[];
  constructor(
    accountId: string,
    balance: Decimal,
    salary?: SalaryInformation[],
  ) {
    this.accountId = accountId;
    this.balance = balance;
    this.salary = salary;
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

  getSalaryInformation(): SalaryInformation[] {
    return this.salary;
  }
}

/*
  SalaryInformation class with the following properties:
    - accountId: string
    - salary: number
    - rate: number
    - payFrequency (monthly or daily)
*/
class SalaryInformation {
  accountId: string;
  salary: Decimal;
  payFrequency: string;
  constructor(accountId: string, salary: Decimal, payFrequency: string) {
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
    logger.debug('date = ' + date);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    logger.debug(`Days in month: ${daysInMonth}`);
    // round to 2 decimal places using Decimal.ROUND_HALF_EVEN
    return salary.salary
      .div(daysInMonth)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
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

async function calculateDailySalariesAllAcount(date: Date): Promise<void> {
  try {
    logger.info('Start calculate daily salaries for all accounts');
    const accountRepository = new AccountRepository();
    const accounts = await accountRepository.getAccounts();
    for (const account of accounts) {
      try {
        const salaryInformations = account.getSalaryInformation(); // Assuming getter exists
        let totalRate = new Decimal(0);
        for (const salaryInformation of salaryInformations) {
          let calculator;
          if (salaryInformation.payFrequency === MONTHLY) {
            calculator = new MonthlySalaryCalculator(date);
          } else {
            calculator = new DailySalaryCalculator();
          }
          const dailyRate = calculator.calculateDailySalary(salaryInformation);
          totalRate = totalRate.add(dailyRate);
        }
        if (totalRate.gt(0)) {
          logger.info(
            `Account ${account.getAccountId()} has a total daily rate of ${totalRate}`,
          );
          await accountRepository.updateBalance(
            account.getAccountId(),
            totalRate,
          );
        }
      } catch (error) {
        logger.error(
          `Error calculating daily salaries for account ${account.getAccountId()}: ${error}`,
        );
      }
    }
    logger.info('Finish calculate daily salaries for all accounts');
  } catch (error) {
    logger.error(`Error calculating daily salaries: ${error}`);
  }
}

// export module
export {
  Account,
  SalaryInformation,
  SalaryCalculator,
  MonthlySalaryCalculator,
  DailySalaryCalculator,
  calculateDailySalariesAllAcount,
};
