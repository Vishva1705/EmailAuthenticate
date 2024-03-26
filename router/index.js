const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')

const User = require('../model/index');
const generateToken = require('../utils/index');
const verifytoken = require('../middleware');


router.get('/test', (req, res) => {
    res.json({ message: 'API Testing Successful' });
});


router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password with the salt
        const hashPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ email, password: hashPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    // Check if user already exists
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return res.status(401).json({ message: "Incorrect Password" })
    }

    const token = generateToken(user);
    res.json({ token });

})

router.get('/data', verifytoken, (req, res) => {
    res.json({ message: `welcome,${req.user.email} This is a protected data!` })
})

router.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        const token = Math.random().toString(36).slice(-8);
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expiry time: 1 hour

        await user.save();

        const transporter = nodemailer.createTransport({
            service: "outlook",
            auth: {
                user: "vishva.d@hindutamil.co.in",
                pass: "It@12345678",
            },
        });

        const message = {
            from: 'vishva.d@hindutamil.co.in',
            to: user.email,
            subject: 'Password Reset Request',
            text: `You are receiving this email to request a password reset for your account. Please use the following token to reset your password: ${token}`,
        };

        transporter.sendMail(message, function(error, info) {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Failed to send email for password reset' });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).json({ message: 'Email sent for password reset' });
            }
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Find user by reset token and ensure the token has not expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        // Save the updated user
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
