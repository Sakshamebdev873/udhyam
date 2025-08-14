require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const registrationRouter = require('./routes/registration');
const prisma = require('./utils/prisma.js');
const path = require('path');
const { fileURLToPath } = require('url');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());
app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});
app.use('/api/v1/registration', registrationRouter);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // optional: run a quick DB check
  try {
    await prisma.$connect();
    console.log('Connected to DB');
  } catch (e) {
    console.error('Prisma connect error', e.message);
  }
});
module.exports = app; // 