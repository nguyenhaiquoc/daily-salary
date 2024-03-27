import { execSync } from 'child_process';

// Function to stop Docker Compose
function stopDockerCompose(): void {
  try {
    execSync('docker compose -f ./testsetup/docker-compose.yaml down', {
      stdio: 'inherit',
    });
    console.log('Docker Compose stopped successfully.');
  } catch (error) {
    console.error('Failed to stop Docker Compose:', error);
    process.exit(1);
  }
}

// Start Docker Compose before running tests
export default stopDockerCompose;
