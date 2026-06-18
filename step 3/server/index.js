const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const bedRoutes = require('./routes/beds');
const patientRoutes = require('./routes/patients');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/patients', patientRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running in Firebase Firestore mode on port ${PORT}`));
