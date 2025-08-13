const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { registrationSchema } = require('../validation/validation');

// Helper to mask Aadhaar for storage/display
function maskAadhaar(aadhaar) {
  // store masked like XXXX-XXXX-1234
  return `XXXX-XXXX-${aadhaar.slice(-4)}`;
}

// Create a new registration
router.post('/', async (req, res) => {
  try {
    const parsed = registrationSchema.parse(req.body);

    // If aadhaar already exists and is verified, reject or attach
    const existing = await prisma.registration.findFirst({ where: { aadhaar: parsed.aadhaar } });
    if (existing) {
      return res.status(409).json({ ok: false, message: 'Aadhaar already submitted' });
    }

    const created = await prisma.registration.create({
      data: {
        aadhaar: parsed.aadhaar,
        aadhaarMasked: maskAadhaar(parsed.aadhaar),
        aadhaarVerified: parsed.otpVerified || false,
        pan: parsed.pan || null,
        applicantName: parsed.applicantName || null,
        mobile: parsed.mobile || null,
        email: parsed.email || null,
        enterpriseName: parsed.enterpriseName || null,
        enterpriseType: parsed.enterpriseType || null,
        businessActivity: parsed.businessActivity || null,
        address: parsed.address || null,
        state: parsed.state || null,
        district: parsed.district || null,
        pincode: parsed.pincode || null,
        otpRequestedAt: parsed.otpRequestedAt ? new Date(parsed.otpRequestedAt) : null,
        otpVerifiedAt: parsed.otpVerified ? new Date() : null
      }
    });

    res.status(201).json({ ok: true, data: { id: created.id } });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ ok: false, errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// List submissions (simple pagination)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page || '1');
  const limit = Math.min(parseInt(req.query.limit || '20'), 100);
  const skip = (page - 1) * limit;
  const items = await prisma.registration.findMany({ take: limit, skip, orderBy: { createdAt: 'desc' } });
  res.json({ ok: true, data: items });
});

// Get single
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const item = await prisma.registration.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ ok: false, message: 'Not found' });
  res.json({ ok: true, data: item });
});

module.exports = router;