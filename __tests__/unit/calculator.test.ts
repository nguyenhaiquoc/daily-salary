import { Decimal } from 'decimal.js';
import { logger } from '../../src/logger';
import { DAILY, MONTHLY } from '../../src/const';
import {
  DailySalaryCalculator,
  SalaryInformation,
  MonthlySalaryCalculator,
} from '../../src/services/salaryCalculator';

describe('DailySalaryCalculator', () => {
  let calculator: DailySalaryCalculator;

  beforeEach(() => {
    calculator = new DailySalaryCalculator();
  });

  const testCases = [
    {
      name: 'Daily salary of 2000',
      dailySalary: new Decimal('2000'),
      expectedDailyRate: new Decimal('2000'),
    },
    {
      name: 'Daily salary of 100',
      dailySalary: new Decimal('100'),
      expectedDailyRate: new Decimal('100'),
    },
    // Add more test cases for different scenarios (e.g., negative salary, other payment types)
  ];

  test.each(testCases)('$name', ({ dailySalary, expectedDailyRate }) => {
    const salary = new SalaryInformation('1', dailySalary, DAILY);
    const dailyRate = calculator.calculateDailySalary(salary);
    expect(dailyRate).toStrictEqual(expectedDailyRate);
  });
});

describe('MonthlySalaryCalculator', () => {
  const testCases = [
    {
      name: 'Monthly salary of 2000 (assuming 31 days)',
      monthlySalary: new Decimal('2000'),
      date: '2024-03-11',
      expectedDailyRate: new Decimal('64.52'),
    },
    {
      name: 'Monthly salary of 100 (assuming 31 days)',
      monthlySalary: new Decimal('100'),
      date: '2024-03-12',
      expectedDailyRate: new Decimal('3.23'),
    },
    {
      name: 'Specific month (Feb 2024 with 29 days)',
      monthlySalary: new Decimal('2000'),
      date: '2024-02-15',
      expectedDailyRate: new Decimal('68.97'),
    },
    {
      name: 'Specific month (Feb 2023 with 28 days)',
      monthlySalary: new Decimal('2000'),
      date: '2023-02-15',
      expectedDailyRate: new Decimal('71.43'),
    },
  ];

  test.each(testCases)(
    '$name',
    ({ monthlySalary, date, expectedDailyRate }) => {
      const salary = new SalaryInformation('1', monthlySalary, MONTHLY);
      let calculator;

      if (date) {
        calculator = new MonthlySalaryCalculator(new Date(date));
      } else {
        calculator = new MonthlySalaryCalculator();
      }

      const dailyRate = calculator.calculateDailySalary(salary);
      logger.debug(`Daily rate: ${dailyRate}`);
      expect(dailyRate).toStrictEqual(expectedDailyRate);
    },
  );
});
