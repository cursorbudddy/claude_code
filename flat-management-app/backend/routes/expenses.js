const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const { start_date, end_date, building_id, category } = req.query;

    let query = `
      SELECT e.*,
        b.name as building_name
       FROM expenses e
       LEFT JOIN buildings b ON e.building_id = b.id
       WHERE 1=1
    `;

    const params = [];

    if (start_date) {
      params.push(start_date);
      query += ` AND e.expense_date >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND e.expense_date <= $${params.length}`;
    }

    if (building_id) {
      params.push(building_id);
      query += ` AND e.building_id = $${params.length}`;
    }

    if (category) {
      params.push(category);
      query += ` AND e.category = $${params.length}`;
    }

    query += ' ORDER BY e.expense_date DESC, e.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get expense categories
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT DISTINCT category FROM expenses ORDER BY category'
    );
    res.json(result.rows.map(row => row.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expense categories' });
  }
});

// Get expense statistics
router.get('/stats', async (req, res) => {
  try {
    const { start_date, end_date, building_id } = req.query;

    let query = `
      SELECT
        COUNT(*) as total_expenses,
        SUM(amount) as total_amount,
        category,
        SUM(amount) as category_amount
      FROM expenses
      WHERE 1=1
    `;

    const params = [];

    if (start_date) {
      params.push(start_date);
      query += ` AND expense_date >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND expense_date <= $${params.length}`;
    }

    if (building_id) {
      params.push(building_id);
      query += ` AND building_id = $${params.length}`;
    }

    query += ' GROUP BY category ORDER BY category_amount DESC';

    const result = await db.query(query, params);

    // Also get total summary
    let summaryQuery = `
      SELECT
        COUNT(*) as total_count,
        COALESCE(SUM(amount), 0) as total_sum
      FROM expenses
      WHERE 1=1
    `;

    const summaryParams = [];

    if (start_date) {
      summaryParams.push(start_date);
      summaryQuery += ` AND expense_date >= $${summaryParams.length}`;
    }

    if (end_date) {
      summaryParams.push(end_date);
      summaryQuery += ` AND expense_date <= $${summaryParams.length}`;
    }

    if (building_id) {
      summaryParams.push(building_id);
      summaryQuery += ` AND building_id = $${summaryParams.length}`;
    }

    const summaryResult = await db.query(summaryQuery, summaryParams);

    res.json({
      summary: summaryResult.rows[0],
      by_category: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expense statistics' });
  }
});

// Get single expense
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT e.*,
        b.name as building_name
       FROM expenses e
       LEFT JOIN buildings b ON e.building_id = b.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// Create new expense
router.post('/', async (req, res) => {
  try {
    const {
      building_id,
      expense_date,
      category,
      description,
      amount,
      payment_method,
      remarks
    } = req.body;

    if (!expense_date || !category || !amount) {
      return res.status(400).json({ error: 'Missing required fields: expense_date, category, amount' });
    }

    const result = await db.query(
      `INSERT INTO expenses
        (building_id, expense_date, category, description, amount, payment_method, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [building_id, expense_date, category, description, amount, payment_method, remarks]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      building_id,
      expense_date,
      category,
      description,
      amount,
      payment_method,
      remarks
    } = req.body;

    const result = await db.query(
      `UPDATE expenses
       SET building_id = COALESCE($1, building_id),
           expense_date = COALESCE($2, expense_date),
           category = COALESCE($3, category),
           description = COALESCE($4, description),
           amount = COALESCE($5, amount),
           payment_method = COALESCE($6, payment_method),
           remarks = COALESCE($7, remarks)
       WHERE id = $8
       RETURNING *`,
      [building_id, expense_date, category, description, amount, payment_method, remarks, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
