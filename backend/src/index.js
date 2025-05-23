const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

// Configure environment variables
dotenv.config();

// Create the app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const dbPath = path.resolve(__dirname, 'database.db');
const db = new Database(dbPath, { verbose: console.log });

// Read and execute schema.sql
const schemaPath = path.resolve(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Execute schema
db.exec(schema);

console.log('Connected to the SQLite database');

// Make db available globally
global.db = db;

// Configure CORS
const corsOptions = {
  origin: '*', // Permitir todas as origens durante o desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware para debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
});

// Routes
app.use('/api', authRoutes);
app.use('/api', itemRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Password Generator API is running');
});

// Function to encrypt existing unencrypted passwords
const migrateUnencryptedPasswords = () => {
  if (!global.db) return;

  console.log('Checking for unencrypted passwords...');
  
  // Function to check if a string is likely encrypted
  const isLikelyEncrypted = (str) => {
    return str && str.includes(':') && /^[0-9a-f]+:[0-9a-f]+$/.test(str);
  };
  
  try {
    // Get all items from database
    const items = db.prepare('SELECT id, password FROM items').all();
    
    if (!items || items.length === 0) {
      console.log('No password items found to migrate');
      return;
    }
    
    console.log(`Found ${items.length} password items to check`);
    
    // For each item, check if password needs encryption
    items.forEach(item => {
      if (!isLikelyEncrypted(item.password)) {
        console.log(`Encrypting password for item ID: ${item.id}`);
        
        try {
          // Import encrypt function
          const { encrypt } = require('./routes/items');
          
          // Encrypt password and update database
          const encryptedPassword = encrypt(item.password);
          db.prepare('UPDATE items SET password = ? WHERE id = ?')
            .run(encryptedPassword, item.id);
          console.log(`Successfully encrypted password for item ID: ${item.id}`);
        } catch (error) {
          console.error(`Failed to encrypt password for item ID ${item.id}:`, error);
        }
      }
    });
  } catch (error) {
    console.error('Error checking for unencrypted passwords:', error.message);
  }
};

// Call migration function after database is initialized and tables are created
setTimeout(migrateUnencryptedPasswords, 2000);

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('Database connection closed');
  process.exit(0);
}); 