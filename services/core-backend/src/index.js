const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authMiddleware = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const { query } = require('./db/client');

const authRoutes = require('./routes/authRoutes');
const policyRoutes = require('./routes/policyRoutes');
const { claims, gigscore, corpus } = require('./routes/placeholders');
const adminRoutes = require('./routes/adminRoutes');
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

// Health Check (public)
app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    return res.status(200).json({
      status: 'OK',
      message: 'GigShield Core Backend is active.',
      dependencies: { database: 'UP' },
    });
  } catch (error) {
    return res.status(200).json({
      status: 'DEGRADED',
      message: 'GigShield Core Backend is active (database unavailable).',
      dependencies: { database: 'DOWN' },
    });
  }
});

// Protected Routes (Mock Firebase Auth applied to all below)
app.use(authMiddleware);

app.use('/api/policy', policyRoutes);
app.use('/api/claims', claims);
app.use('/api/gigscore', gigscore);
app.use('/api/corpus', corpus);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`GigShield Core Backend running on port ${PORT}`);
  startTriggerMonitor();
});
