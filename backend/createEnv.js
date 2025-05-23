const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a random JWT secret
const generateSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate a 32-byte encryption key
const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex').slice(0, 32);
};

// Env file content
const envContent = `PORT=3000
JWT_SECRET=${generateSecret()}
ENCRYPTION_KEY=${generateEncryptionKey()}
`;

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('\x1b[33m%s\x1b[0m', '.env file already exists. Skipping creation.');
} else {
  // Write the .env file
  fs.writeFileSync(envPath, envContent);
  console.log('\x1b[32m%s\x1b[0m', '.env file created successfully with secure JWT_SECRET and ENCRYPTION_KEY.');
}

console.log('\x1b[36m%s\x1b[0m', 'You can start the server with: npm start'); 