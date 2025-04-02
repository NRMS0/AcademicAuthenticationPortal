const express = require('express');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Setup 2FA - Generate secret and QR code
router.get('/setup', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    //Prevent overwriting existing 2FA secret
    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA already enabled' });
    }

    const secret = speakeasy.generateSecret({ name: `AuthPortal (${user.email})` });
    user.twoFactorSecret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, qrCodeDataURL) => {
      if (err) {
        console.error('QR Code Generation Error:', err);
        return res.status(500).json({ message: 'QR code generation failed' });
      }
      res.json({ qrCode: qrCodeDataURL });
    });
  } catch (error) {
    console.error('2FA Setup Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

//Verify 2FA token
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);

    if (!token || !user?.twoFactorSecret) {
      return res.status(400).json({ success: false, message: 'Missing token or 2FA secret' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
  } catch (error) {
    console.error('2FA Verification Error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});


// POST verify 2FA login
router.post('/login/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const tempUserId = req.session.tempUserId;

    if (!tempUserId) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    const user = await User.findById(tempUserId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "Invalid 2FA user or secret" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    req.session.userId = tempUserId;
    delete req.session.tempUserId;

    const jwtToken = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ message: "2FA verified", token: jwtToken, role: user.role });

  } catch (error) {
    console.error('2FA login verify error:', error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
});

// Disable 2FA
router.post('/disable', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    res.json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Disable 2FA Error:', error);
    res.status(500).json({ message: 'Failed to disable 2FA', error: error.message });
  }
});

module.exports = router;