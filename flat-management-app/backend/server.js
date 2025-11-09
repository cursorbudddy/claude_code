const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const buildingRoutes = require('./routes/buildings');
const flatRoutes = require('./routes/flats');
const tenantRoutes = require('./routes/tenants');
const rentalRoutes = require('./routes/rentals');
const paymentRoutes = require('./routes/payments');
const expenseRoutes = require('./routes/expenses');
const dashboardRoutes = require('./routes/dashboard');

// Use routes
app.use('/api/buildings', buildingRoutes);
app.use('/api/flats', flatRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
