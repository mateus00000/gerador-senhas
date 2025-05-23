const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Signup route
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    const { email, name, password, confirmPassword } = req.body;
    
    // Validate required fields
    if (!email || !name || !password || !confirmPassword) {
      console.log('Missing required fields:', { email, name, password: !!password, confirmPassword: !!confirmPassword });
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate email format
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    try {
      // Check if email already exists
      const stmt = global.db.prepare('SELECT * FROM users WHERE email = ?');
      const existingUser = stmt.get(email);
      
      if (existingUser) {
        console.log('Email already in use:', email);
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Generate UUID
      const id = uuidv4();
      
      // Insert user into database
      const insertStmt = global.db.prepare(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)'
      );
      insertStmt.run(id, name, email, hashedPassword);
      
      // Generate JWT
      const token = jwt.sign(
        { id, email, name },
        process.env.JWT_SECRET || 'default_secret_key',
        { expiresIn: '24h' }
      );
      
      console.log('User created successfully:', { id, email });
      return res.status(201).json({ token });
    } catch (error) {
      console.error('Error during user creation:', error);
      return res.status(500).json({ message: 'Server error during user creation' });
    }
  } catch (error) {
    console.error('Signup error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Signin route
router.post('/signin', async (req, res) => {
  try {
    console.log('Signin request received:', req.body);
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      console.log('Missing signin fields:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    try {
      // Find user by email
      const stmt = global.db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email);
      
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'default_secret_key',
        { expiresIn: '24h' }
      );
      
      console.log('User logged in successfully:', email);
      return res.json({ token });
    } catch (error) {
      console.error('Error during authentication:', error);
      return res.status(500).json({ message: 'Server error during authentication' });
    }
  } catch (error) {
    console.error('Signin error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 