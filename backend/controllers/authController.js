import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, name, email, password, bio, avatar } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'This username is already taken. Please choose another one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

    const user = new User({
      username,
      name: name || '',
      email,
      password: hashedPassword,
      bio: bio || '',
      avatar: avatar || undefined,
      isVerified: false,
      otp: otpCode,
      otpExpires: otpExpires,
    });

    await user.save();

    // Log the OTP code to console
    console.log(`\n====================================\n[OTP] Verification Code for ${email}: ${otpCode}\n====================================\n`);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Account Verification OTP',
        message: `Welcome! Your verification OTP code is ${otpCode}. It will expire in 10 minutes.`,
      });
    } catch (emailError) {
      console.error('Error sending welcome email', emailError);
    }

    res.status(201).json({
      message: 'Registration successful. OTP sent to your email.',
      email: user.email,
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user account is verified
    if (!user.isVerified) {
      // Regenerate OTP on login attempt to ensure they can verify
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otpCode;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      console.log(`\n====================================\n[OTP] Re-sent Verification Code for ${email}: ${otpCode}\n====================================\n`);

      try {
        await sendEmail({
          email: user.email,
          subject: 'Your Account Verification OTP',
          message: `Your new verification OTP code is ${otpCode}. It will expire in 10 minutes.`,
        });
      } catch (emailError) {
        console.error('Error sending OTP email', emailError);
      }

      return res.status(400).json({
        message: 'Please verify your email address first. A new OTP has been sent.',
        email: user.email,
        unverified: true
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP code has expired' });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: 'Account verified successfully. Please log in.' });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};

// RESEND OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`\n====================================\n[OTP] Re-sent Verification Code for ${email}: ${otpCode}\n====================================\n`);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Account Verification OTP',
        message: `Your new verification OTP code is ${otpCode}. It will expire in 10 minutes.`,
      });
    } catch (emailError) {
      console.error('Error sending OTP email', emailError);
    }

    res.status(200).json({ message: 'A new OTP has been sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend OTP', error: err.message });
  }
};