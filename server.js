require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());                 
app.use('/', express.static('public'));  

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personal_budget';

(async () => {
  try {
    await mongoose.connect(uri); 
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
})();

const BudgetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 0 },
    color: { type: String, required: true, match: /^#([A-Fa-f0-9]{6})$/ },
  },
  { versionKey: false, timestamps: true }
);

const Budget = mongoose.model('Budget', BudgetSchema);


app.get('/hello', (_req, res) => res.send('Hello World!'));

app.get('/budget', async (_req, res) => {
  try {
    const items = await Budget.find().sort({ title: 1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'ServerError', details: e.message });
  }
});

app.post('/budget', async (req, res) => {
  try {
    const { title, value, color } = req.body;
    const doc = await Budget.create({ title, value, color });
    res.status(201).json(doc);
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res.status(400).json({ error: 'ValidationError', details: e.errors });
    }
    res.status(500).json({ error: 'ServerError', details: e.message });
  }
});

const fs = require('fs');
app.post('/seed-once', async (_req, res) => {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'budget.json'), 'utf8'));
    const items = (raw.myBudget || raw).map(x => ({
      title: x.title,
      value: Number(x.value ?? x.budget),
      color: x.color,
    }));
    const result = await Budget.insertMany(items);
    res.json({ inserted: result.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});
