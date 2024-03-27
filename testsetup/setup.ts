import { execSync } from 'child_process';

process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.DATABASE_URL =
  'postgresql://salary-hero:salary-hero@127.0.0.1:5123/salaryhero';

// Function to start Docker Compose
function startDockerCompose(): void {
  try {
    console.log('start docker compose');
    // start Docker Compose in detached mode, the files is in /devops/docker-compose.yml
    execSync('docker compose -f ./testsetup/docker-compose.yaml up -d', {
      stdio: 'inherit',
    });
    console.log('Docker Compose started successfully.');

    execSync('npx prisma db push');
  } catch (error) {
    console.error('Failed to start Docker Compose:', error);
    process.exit(1);
  }
}

// Start Docker Compose before running tests
export default startDockerCompose;
