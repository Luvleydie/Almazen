const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/almacen';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// generic schema for inventory tables with dynamic fields
const tableSchema = new mongoose.Schema({
  name: String,
  columns: [String]
});

const Table = mongoose.model('Table', tableSchema);

// each table will have its own collection of items
function getItemModel(tableName) {
  // allow arbitrary fields
  return mongoose.model(tableName + '_Item', new mongoose.Schema({}, { strict: false }), tableName + '_items');
}

// create new inventory table definition
app.post('/api/tables', async (req, res) => {
  const { name, columns } = req.body;
  try {
    const table = await Table.create({ name, columns });
    res.status(201).json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// list tables
app.get('/api/tables', async (req, res) => {
  const tables = await Table.find();
  res.json(tables);
});

// add item to a table
app.post('/api/tables/:id/items', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const table = await Table.findById(id);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    const Item = getItemModel(table.name);
    const item = await Item.create(data);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// list items from a table
app.get('/api/tables/:id/items', async (req, res) => {
  const { id } = req.params;
  try {
    const table = await Table.findById(id);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    const Item = getItemModel(table.name);
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
