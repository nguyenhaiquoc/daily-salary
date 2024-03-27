# Daily salary calculator

A simple TypeScript script that automates daily account balance updates at midnight, reflecting your work progress in the month. 


## Description

This lightweight script automates the tedious task of manually updating your salary balance each day. It calculates your daily earnings based on your total salary and work schedule, ensuring your balance accurately reflects your accrued amount for the days worked.

### Prerequisites

- NodeJS: 20.10
- Typescript: 5
- Docker: 24 (For testing purpose)
- PostgreSQL:16 

### Installation Steps

- npm run install
- npm run build
- create DATABASE_URL variable in .env file (please see .env_sample file)
- npx prisma db push  (Optional - to init database schema)
- ./setupCron.sh   (Optional - to setup cronjob run at 1AM everyday)
- npm run test (Optional - this will start a PostgreSQL docker containter for testing purpose)
- npm run start 

### Design and Component 
* PostgreSQL DB: This project is about money, so strong financial data consistency is required, so I use PostgreSQL to store data.
* Salary Calculation Engine (Strategy Pattern): Currently, the system supports two payment types: monthly and daily. However, anticipating future needs, we've implemented the Strategy pattern. This defines a common interface, `SalaryCalculator`, with a `calculateDailySalary()` method. Specific salary calculation methods (e.g., `FixedSalaryCalculator`, `MonthlySalaryCalculator`) can then be implemented as separate classes inheriting from this interface, providing flexibility for handling diverse salary structures.
* Database interaction: We utilize the Prisma library to interact with PostgreSQL and employ repository pattern to separate the business domain logic from the data access layer.
* Job scheduler: to run script every mid-night. Simple solution, just use cronjob, setup file: ./setupCron.sh

### Database schema and some technical details
For full schema, see schema.prisma file in the root folder.
* Account: Stores account information and the balance (as a `Decimal`) of the account.
* SalaryInfo: : Contains fields such as `account_id`, `payFrequency` (either "Monthly" or "Daily"), and `amount`. In reality, additional columns like `effective_date` might be present, but for this demo, I've kept it simple.
* AuditLog: Used to track whether an account has been processed on a given day. The primary purpose is to prevent multiple updates to the account balance within a single day, which is unacceptable in the financial domain.
* All updates to the `Account` (specifically the `balance`) will be implemented within a transaction. An insert into the `AuditLog` will also occur to ensure consistency. The isolation level will be set to `RepeatableRead` to avoid the lost update phenomenon in case other processes attempt to update the same account record.
* The codebase uses Decimal (via Decimal.js) to avoid floating-point rounding errors.
* The flow: query all account and salary information data ==> process them one by one ==> update.

### Some possible improvement.
* Use a job management tool such as Node-Scheduler or Apache Airflow for more control over the cron job.
* We can break the Account table by ID range or any other criteria and run multiple scripts to process subsets of data concurrently, which will speed up the job
* Implement retry/backfill logic in case the script fails for whatever reason. We do have an AuditLog to determine which ones haven’t been processed yet.
  
