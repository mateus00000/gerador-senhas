const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all item routes
router.use('/item', authMiddleware);
router.use('/items', authMiddleware);

// Encryption settings
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'my-secret-key-exactly-32-bytes!!';
const IV_LENGTH = 16; // For AES, this is always 16

// Encrypt function
function encrypt(text) {
  try {
    if (typeof text !== 'string') {
      // If not a string, convert to string
      text = String(text);
    }
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    // Return original text if encryption fails
    return text;
  }
}

// Decrypt function
function decrypt(text) {
  try {
    // Check if the text appears to be encrypted (contains a colon)
    if (!text || typeof text !== 'string' || !text.includes(':')) {
      return text; // Return as is if not encrypted
    }
    
    const textParts = text.split(':');
    // Basic validation
    if (textParts.length !== 2) {
      return text; // Not in the expected format
    }
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    // If decryption fails, return the original text with a marker
    return `${text} [ENCRYPTED]`;
  }
}

// Create a new password item
router.post('/item', (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password are required' });
    }
    
    // Check if item with same name already exists for this user
    const checkStmt = global.db.prepare('SELECT * FROM items WHERE user_id = ? AND name = ?');
    const item = checkStmt.get(userId, name);
    if (item) {
      return res.status(400).json({ message: 'Item with this name already exists' });
    }
    
    // Generate UUID
    const id = uuidv4();
    
    // Encrypt password
    const encryptedPassword = encrypt(password);
    
    // Insert item into database
    const insertStmt = global.db.prepare('INSERT INTO items (id, user_id, name, password) VALUES (?, ?, ?, ?)');
    insertStmt.run(id, userId, name, encryptedPassword);

    return res.status(201).json({
      id,
      name,
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('Create item error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all password items for the authenticated user
router.get('/items', (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all items for the user
    const stmt = global.db.prepare('SELECT id, name, password, created_at FROM items WHERE user_id = ? ORDER BY created_at DESC');
    const items = stmt.all(userId);
    
    // Decrypt passwords for client
    const decryptedItems = items.map(item => {
      try {
        return {
          ...item,
          password: decrypt(item.password)
        };
      } catch (error) {
        console.error(`Error decrypting password for item ${item.id}:`, error);
        return {
          ...item,
          password: '**DECRYPTION_ERROR**'
        };
      }
    });
    
    return res.json(decryptedItems || []);
  } catch (error) {
    console.error('Get items error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete a password item
router.delete('/item/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`[items.js] Tentando deletar item ID: ${id} para User ID: ${userId}`);

    // 1. Prepare o statement SQL
    const stmt = global.db.prepare('DELETE FROM items WHERE id = ? AND user_id = ?');
    
    // 2. Execute o statement com os parâmetros
    // O método .run() em um statement preparado do better-sqlite3 retorna um objeto com 'changes'
    const info = stmt.run(id, userId);

    if (info.changes > 0) {
      console.log(`[items.js] Item com ID ${id} deletado com sucesso. Mudanças: ${info.changes}`);
      return res.status(200).json({ message: 'Item deleted successfully' });
    } else {
      // Isso pode significar que o item não existe ou não pertence ao usuário.
      console.log(`[items.js] Item com ID ${id} não encontrado para o User ID: ${userId} ou já deletado.`);
      return res.status(404).json({ message: 'Item not found or not authorized' });
    }
  } catch (error) { // Este catch pegará erros do prepare() ou do run()
    console.error('[items.js] Erro ao deletar item:', error.message);
    // Verificar se o erro é do banco de dados ou outro tipo
    if (error.code && error.code.startsWith('SQLITE_')) {
        return res.status(500).json({ message: 'Database error during deletion', error: error.message });
    }
    return res.status(500).json({ message: 'Server error while deleting item', error: error.message });
  }
});

module.exports = router;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt; 