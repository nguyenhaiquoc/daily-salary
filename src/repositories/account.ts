import { Prisma, PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { SalaryInformation, Account } from '../calculator'
import { COMPLETED_STATUS } from '../const';
import { logger } from '../logger';


class AccountRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }


  async getAccountById(accountId: string): Promise<Account> {
    const account = await this.prisma.account.findUnique({
      where: {
        accountId: accountId
      },
      include: {
        salaryinfo: true,
      }
    });
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }
    const salary = account.salaryinfo.map(salary => {
      return new SalaryInformation(salary.accountId, new Decimal(salary.salary), salary.payFrequency);
    });
    return new Account(account.accountId, new Decimal(account.balance), salary);
  }
  /*
    Get all acount and salary information, return calculator Account[] object,
    convert salary to calculator.SalaryInformation object before init Account object
  */
  async getAccounts(): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({ include: { salaryinfo: true } });
    return accounts.map(account => {
      const salary = account.salaryinfo.map(salary => {
        return new SalaryInformation(salary.accountId, new Decimal(salary.salary), salary.payFrequency);
      });
      return new Account(account.accountId, new Decimal(account.balance), salary);
    });
  }

  /*
    Update balance delta of account and auditlog in a transaction
  */
  async updateBalance(accountId: string, delta: Decimal, processDate: Date = new Date()): Promise<void> {
    /*
      update balance + create audit log in a transaction to ensure data consistency
      so if we need to rerun, we won't add more money to the account
      use balance = balance + delta to avoid read-modify-write anti-pattern
      use REPEATABLE READ isolation level to ensure no other transaction can update the balance
    */
    processDate.setHours(0, 0, 0, 0);
    try {
      // query if today audit log exists, if not, process
      await this.prisma.$transaction([
        this.prisma.account.update({
          where: {
            accountId: accountId
          },
          data: {
            balance: {
              increment: delta
            }
          }
        }),
        this.prisma.auditLog.create({
          data: {
            accountId: accountId,
            updateDate: processDate,
            status: COMPLETED_STATUS,
            createdAt: new Date()
          }
        })
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      })
    }
    catch (error) {
      logger.error(`Error updating balance for account ${accountId}: ${error}`);
      throw error;
    }
  }
}

export default AccountRepository;
