require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const registrationRouter = require('./routes/registration');
const prisma = require('./utils/prisma.js');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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