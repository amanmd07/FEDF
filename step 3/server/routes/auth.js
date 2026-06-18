const express = require('express');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { FieldValue } = require('firebase-admin/firestore');

const statsRef = db.collection('stats').doc('loginAttempts');

// Route to get current login count/attempts
router.get('/login-attemptex', async (req, res) => {
    try {
        const doc = await statsRef.get();
        const stats = doc.exists ? doc.data() : { pageOpens: 0, attempts: 0, successes: 0 };
        res.json(stats);
    } catch (e) {
        console.error("Error reading login stats:", e);
        res.status(500).json({ message: 'Database error' });
    }
});

let lastIncrementTime = 0;

// Route to increment page open count when login page is visited
router.post('/login-attemptex/increment-page', async (req, res) => {
    const now = Date.now();
    try {
        if (now - lastIncrementTime > 500) {
            const doc = await statsRef.get();
            if (!doc.exists) {
                await statsRef.set({ pageOpens: 1, attempts: 0, successes: 0 });
            } else {
                await statsRef.update({ pageOpens: FieldValue.increment(1) });
            }
            lastIncrementTime = now;
        }
        const doc = await statsRef.get();
        res.json(doc.exists ? doc.data() : { pageOpens: 0, attempts: 0, successes: 0 });
    } catch (e) {
        console.error("Error incrementing page opens:", e);
        res.status(500).json({ message: 'Database error' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });

    try {
        // Increment total login attempts
        const docStats = await statsRef.get();
        if (!docStats.exists) {
            await statsRef.set({ pageOpens: 0, attempts: 1, successes: 0 });
        } else {
            await statsRef.update({ attempts: FieldValue.increment(1) });
        }

        // Find user
        const userDoc = await db.collection('users').doc(username).get();
        if (!userDoc.exists) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = userDoc.data();
        let ok = false;
        if (user.passwordHash) {
            ok = await bcrypt.compare(password, user.passwordHash);
        } else if (user.password) {
            ok = (user.password === password);
        }

        if (!ok) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Success! Increment successful login count
        await statsRef.update({ successes: FieldValue.increment(1) });

        const token = jwt.sign(
            { username: user.username || username, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '8h' }
        );
        res.json({ token, user: { username: user.username || username, role: user.role } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;
