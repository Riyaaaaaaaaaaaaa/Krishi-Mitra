const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateVerificationCode, sendVerificationEmail } = require('../utils/emailService');

const router = express.Router();

// Register - Step 1: Send verification code
router.post('/register/send-code', async (req, res) => {
  try {
    const { email, name } = req.body;
    console.log('📧 Received request to send code to:', email, 'Name:', name);

    if (!email || !name) {
      console.log('❌ Missing email or name');
      return res.status(400).json({ error: 'Email and name are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      console.log('❌ User already exists and is verified');
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log('🔑 Generated verification code:', code);

    // Save or update user with verification code
    if (existingUser) {
      existingUser.verificationCode = code;
      existingUser.verificationCodeExpires = expiresAt;
      await existingUser.save();
      console.log('✅ Updated existing user with new code');
    } else {
      const tempUser = new User({
        name,
        email,
        password: 'temp', // Will be updated after verification
        verificationCode: code,
        verificationCodeExpires: expiresAt
      });
      await tempUser.save();
      console.log('✅ Created new temporary user');
    }

    // Send email
    console.log('📨 Attempting to send email...');
    // Get user language preference if exists, default to 'en'
    const language = existingUser?.preferences?.language || 'en';
    const emailSent = await sendVerificationEmail(email, code, name, language);
    
    if (!emailSent) {
      console.log('❌ Failed to send email');
      return res.status(500).json({ error: 'Failed to send verification email. Please check email configuration.' });
    }

    console.log('✅ Email sent successfully!');
    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('❌ Send code error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Register - Step 2: Verify code and complete registration
router.post('/register/verify', async (req, res) => {
  try {
    const { email, code, password, phone } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if code is valid and not expired
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ error: 'Verification code expired. Please request a new code.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    user.password = hashedPassword;
    user.phone = phone || user.phone;
    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    console.log('✅ User registered successfully:', email);
    res.json({ 
      message: 'Registration successful', 
      user: {
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('❌ Verify code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ 
      message: 'Login successful',
      user: {
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
