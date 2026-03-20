const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authMiddleware = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const policyRoutes = require('./routes/policyRoutes');
const { claims, gigscore, corpus } = require('./routes/placeholders');
const { startTriggerMonitor } = require('./services/triggerMonitor');

const app = express();
const PORT = process.env.PORT || 3000;

// Standard Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes (Mock Firebase Auth applied to all below)
app.use(authMiddleware);

app.use('/api/policy', policyRoutes);
app.use('/api/claims', claims);
app.use('/api/gigscore', gigscore);
app.use('/api/corpus', corpus);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'GigShield Core Backend is active.' });
});

app.listen(PORT, () => {
  console.log(`GigShield Core Backend running on port ${PORT}`);
  startTriggerMonitor();
});
