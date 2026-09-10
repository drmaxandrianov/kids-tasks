import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Default data structure
const defaultData = {
  users: [],
  tasks: [],
  assignments: [],
  penalties: [],
  settings: {
    adminLogin: 'admin',
    adminPassword: 'admin',
    rewards: [
      { points: 50, amount: 100 },
      { points: 100, amount: 250 },
      { points: 150, amount: 500 },
    ],
  },
  childAvatars: {},
};

// Read data from file
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...defaultData, ...parsed };
    }
  } catch (err) {
    console.error('Error reading data file:', err);
  }
  return { ...defaultData };
}

// Write data to file
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing data file:', err);
    return false;
  }
}

// Initialize data file if not exists
if (!fs.existsSync(DATA_FILE)) {
  writeData(defaultData);
  console.log('Created initial data.json');
}

// ===== API Routes =====

// Get all data
app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

// Save all data (full replace)
app.put('/api/data', (req, res) => {
  const newData = req.body;
  if (!newData || typeof newData !== 'object') {
    return res.status(400).json({ error: 'Invalid data' });
  }
  const success = writeData({ ...defaultData, ...newData });
  if (success) {
    res.json({ ok: true });
  } else {
    res.status(500).json({ error: 'Failed to write data' });
  }
});

// ===== Serve static files =====
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback — all other routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
