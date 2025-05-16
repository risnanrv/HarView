const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create cache directory if it doesn't exist
const cacheDir = '/opt/render/.cache/puppeteer';
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Install Chrome
console.log('Installing Chrome...');
try {
  // Update package list
  execSync('apt-get update', { stdio: 'inherit' });
  
  // Install Chrome dependencies
  execSync('apt-get install -y wget gnupg', { stdio: 'inherit' });
  
  // Add Google Chrome repository
  execSync('wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -', { stdio: 'inherit' });
  execSync('echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list', { stdio: 'inherit' });
  
  // Update package list again
  execSync('apt-get update', { stdio: 'inherit' });
  
  // Install Chrome
  execSync('apt-get install -y google-chrome-stable', { stdio: 'inherit' });
  
  console.log('Chrome installed successfully!');
} catch (error) {
  console.error('Error installing Chrome:', error);
  process.exit(1);
} 