import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';
import {
  Account,
  calculateDailySalariesAllAcount,
  SalaryInformation,
} from '../../src/services/salaryCalculator';
import { DAILY, MONTHLY } from '../../src/const';
import AccountRepository from '../../src/repositories/account';

const prisma = new PrismaClient();
async function setUpAccountData(): Promise<void> {
  /*
    Prepare test data for account and salary info table
  */
  const prepareData = [
    {
      accountId: 'abcd123',
      balance: new Decimal(0),
      salary: [{ salary: new Decimal(1000), payFrequency: DAILY }],
    },
    {
      accountId: 'abcd124',
      balance: new Decimal(0),
      salary: [{ salary: new Decimal(43000), payFrequency: MONTHLY }],
    },
    {
      accountId: 'abcd125',
      balance: new Decimal(0),
      salary: [
        { salary: new Decimal(20000), payFrequency: MONTHLY },
        { salary: new Decimal(1000), payFrequency: DAILY },
      ],
    },
    {
      accountId: 'abcd221',
      balance: new Decimal(0),
      salary: [{ salary: new Decimal(1000), payFrequency: DAILY }],
    },
    {
      accountId: 'abcd222',
      balance: new Decimal(0),
      salary: [{ salary: new Decimal(43000), payFrequency: MONTHLY }],
    },
    {
      accountId: 'abcd223',
      balance: new Decimal(0),
      salary: [
        { salary: new Decimal(20000), payFrequency: MONTHLY },
        { salary: new Decimal(1000), payFrequency: DAILY },
      ],
    },
  ];

  for (const account of prepareData) {
    await prisma.account.create({
      data: {
        accountId: account.accountId,
        balance: account.balance,
        salaryinfo: {
          create: account.salary.map((salary) => {
            return {
              salary: salary.salary,
              payFrequency: salary.payFrequency,
            };
          }),
        },
      },
    });
  }
}

beforeAll(async () => {
  return await setUpAccountData();
});

afterAll(async () => {
  await prisma.salaryInfo.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.account.deleteMany();
});

describe('getAccounts', () => {
  /*
    Use prisma to delete test data after test
  */
  it('should return all accounts with salary information', async () => {
    const accountRepository = new AccountRepository();
    const accounts = await accountRepository.getAccounts();
    expect(accounts).toHaveLength(6);
    expect(accounts[0]).toBeInstanceOf(Account);
    expect(accounts[0].getSalaryInformation()).toHaveLength(1);
    expect(accounts[0].getSalaryInformation()[0]).toBeInstanceOf(
      SalaryInformation,
    );

    // assert salary data based on prepareData
    expect(accounts[0].getSalaryInformation()[0].salary.toNumber()).toBe(1000);
  });
});

describe('updateAccountBalance', () => {
  it('should update account balance', async () => {
    const accountRepository = new AccountRepository();
    const account = new Account('abcd123', new Decimal(0));
    await accountRepository.updateBalance(
      account.getAccountId(),
      new Decimal(1000),
    );
    // wait for the account balance update to be completed
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // query account to check if balance is updated
    const updatedAccountData = await accountRepository.getAccountById(
      account.getAccountId(),
    );
    expect(updatedAccountData.getAccumulatedBalance().toNumber()).toBe(1000);
  });

  it('should throw error if update account twice', async () => {
    const accountId = 'abcd124';
    const accountRepository = new AccountRepository();
    const account = new Account(accountId, new Decimal(0));
    await accountRepository.updateBalance(
      account.getAccountId(),
      new Decimal(1000),
    );
    // update again, check if throw error or not
    await expect(
      accountRepository.updateBalance(
        account.getAccountId(),
        new Decimal(1000),
      ),
    ).rejects.toThrow();
  });

  it('should throw error if update to non exist account', async () => {
    const accountId = 'abcd126';
    const accountRepository = new AccountRepository();
    const account = new Account(accountId, new Decimal(0));
    await expect(
      accountRepository.updateBalance(
        account.getAccountId(),
        new Decimal(1000),
      ),
    ).rejects.toThrow();
  });
});

describe('updateAllAccounts', () => {
  it('should update all accounts with new balance', async () => {
    const date = new Date('2024-03-12');
    await calculateDailySalariesAllAcount(date);
    // declare mapping between accountId and expectedBalance
    const accountIds = [
      { accountId: 'abcd221', expectedBalance: new Decimal('1000') },
      { accountId: 'abcd222', expectedBalance: new Decimal('1387.10') },
      { accountId: 'abcd223', expectedBalance: new Decimal('1645.16') },
    ];
    // check balance for each account
    for (const account of accountIds) {
      const accountData = await prisma.account.findUnique({
        where: {
          accountId: account.accountId,
        },
      });
      // convert balance to Decimal and compare
      expect(new Decimal(accountData?.balance)).toEqual(
        account.expectedBalance,
      );
    }
  });
});
