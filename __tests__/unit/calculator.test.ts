import {
  DailySalaryCalculator,
  SalaryInformation,
  PaymentType,
  MonthlySalaryCalculator,
} from '../../src/calculator';

describe('DailySalaryCalculator', () => {
  let calculator: DailySalaryCalculator;

  beforeEach(() => {
    calculator = new DailySalaryCalculator();
  });

  const testCases = [
    { name: 'Daily salary of 2000', dailySalary: 2000, expectedDailyRate: 2000 },
    { name: 'Daily salary of 100', dailySalary: 100, expectedDailyRate: 100 },
    // Add more test cases for different scenarios (e.g., negative salary, other payment types)
  ];

  test.each(testCases)('$name', ({ dailySalary, expectedDailyRate }) => {
    const salary = new SalaryInformation('1', dailySalary, PaymentType.DAILY);
    const dailyRate = calculator.calculateDailySalary(salary);
    expect(dailyRate).toBe(expectedDailyRate);
  });
});


describe('MonthlySalaryCalculator', () => {
  const testCases = [
    { name: 'Monthly salary of 2000 (assuming 31 days)', monthlySalary: 2000, date: "2024-03-11", expectedDailyRate: 64.516 },
    { name: 'Monthly salary of 100 (assuming 31 days)', monthlySalary: 100, date: "2024-03-12", expectedDailyRate: 3.226 },
    { name: 'Specific month (Feb 2024 with 29 days)', monthlySalary: 2000, date: "2024-02-15", expectedDailyRate: 68.965 },
    { name: 'Specific month (Feb 2023 with 28 days)', monthlySalary: 2000, date: "2023-02-15", expectedDailyRate: 71.428 },
  ];

  test.each(testCases)('$name', ({ monthlySalary, date, expectedDailyRate}) => {
    const salary = new SalaryInformation('1', monthlySalary, PaymentType.MONTHLY);
    let calculator;

    if (date) {
      calculator = new MonthlySalaryCalculator(new Date(date));
    } else {
      calculator = new MonthlySalaryCalculator();
    }

    const dailyRate = calculator.calculateDailySalary(salary);
    expect(dailyRate).toBeCloseTo(expectedDailyRate);
  });
});
