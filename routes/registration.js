// routes/registration.routes.js
const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { registrationSchema } = require('../validation/validation');
const puppeteer = require('puppeteer');

// Store temporary verification sessions in memory
const sessions = {}; 

// Mask Aadhaar
function maskAadhaar(aadhaar) {
  return `XXXX-XXXX-${aadhaar.slice(-4)}`;
}
  //  // Fill Aadhaar number
  //   await page.type('#ctl00_ContentPlaceHolder1_txtadharno', aadhaar, { delay: 100 });

  //   // Fill Aadhaar holder's name
  //   await page.type('#ctl00_ContentPlaceHolder1_txtownername', name, { delay: 100 });

  //   // Click Validate & Generate OTP
  //   await page.click('#ctl00_ContentPlaceHolder1_btnValidateAadhaar');

  //   // Wait for OTP field
  //   await page.waitForSelector('#ctl00_ContentPlaceHolder1_txtOtp1', { timeout: 120000 });

  //   // If OTP is provided in request, enter it and click Validate
  //   let otpVerified = false;
  //   if (otp) {
  //     await page.type('#ctl00_ContentPlaceHolder1_txtOtp1', otp, { delay: 100 });
  //     await page.click('#ctl00_ContentPlaceHolder1_btnValidateOtp'); // Validate OTP button




router.post('/aadhaar', async (req, res) => {
  const { aadhaar, name } = req.body;

  // Validate inputs
  if (!/^\d{12}$/.test(aadhaar)) {
    return res.status(400).json({ ok: false, message: 'Invalid Aadhaar format' });
  }
  if (!name || name.trim().length < 3) {
    return res.status(400).json({ ok: false, message: 'Invalid name format' });
  }

  try {
    const browser = await puppeteer.launch({ headless: true, timeout: 60000 });
    const page = await browser.newPage();

    // Open Udyam Registration page
    await page.goto('https://udyamregistration.gov.in/UdyamRegistration.aspx', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Fill Aadhaar number
    await page.type('#ctl00_ContentPlaceHolder1_txtadharno', aadhaar, { delay: 100 });

    // Fill Aadhaar holder's name
    await page.type('#ctl00_ContentPlaceHolder1_txtownername', name, { delay: 100 });

    // Click Validate & Generate OTP button
    await page.click('#ctl00_ContentPlaceHolder1_btnValidateAadhaar');
    await new Promise(resolve => setTimeout(resolve, 3000)); 
    // Close browser immediately
    await browser.close();

    // Save session (OTP not yet verified)
    const sessionId = Date.now().toString();
    sessions[sessionId] = { aadhaar, name, otpVerified: false };

    res.json({ ok: true, message: 'OTP generation initiated', sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to initiate OTP generation' });
  }
});



// STEP 1.5 — OTP verification

router.post('/otp', async (req, res) => {
  const { sessionId, otp } = req.body;
  let browser;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate and fill Aadhaar/Name
    await page.goto('https://udyamregistration.gov.in/UdyamRegistration.aspx', { 
      waitUntil: 'networkidle2', 
      timeout: 120000 
    });
    await page.type('#ctl00_ContentPlaceHolder1_txtadharno', sessions[sessionId].aadhaar);
    await page.type('#ctl00_ContentPlaceHolder1_txtownername', sessions[sessionId].name);

    // Submit Aadhaar and verify success
    await page.click('#ctl00_ContentPlaceHolder1_btnValidateAadhaar');
        await new Promise(resolve => setTimeout(resolve, 3000)); 

    // Check for Aadhaar errors
    const aadhaarError = await page.$('#ctl00_ContentPlaceHolder1_lblMessageAadhaar');
    if (aadhaarError) {
      const errorText = await page.evaluate(el => el.textContent.trim(), aadhaarError);
      throw new Error(`Aadhaar error: ${errorText}`);
    }

    // Wait for OTP field or error
    try {
      await Promise.race([
        page.waitForSelector('#ctl00_ContentPlaceHolder1_txtOtp1', { timeout: 60000 }),
        page.waitForSelector('.error-message', { timeout: 60000 }) // Generic error fallback
      ]);
    } catch (err) {
      await page.screenshot({ path: 'otp_timeout.png' });
      throw new Error('OTP field did not appear. Check screenshot.');
    }

    // Enter OTP and submit
    await page.type('#ctl00_ContentPlaceHolder1_txtOtp1', otp);
    await page.click('#ctl00_ContentPlaceHolder1_btnValidateOtp');
    await page.waitForNavigation({ timeout: 60000 });

    // Verify OTP success (check for next step)
    await page.waitForSelector('#ctl00_ContentPlaceHolder1_txtPanNo', { timeout: 30000 });

    res.json({ ok: true, message: 'OTP verified' });
  } catch (err) {
    console.error('OTP Error:', err);
    res.status(500).json({ 
      ok: false, 
      message: err.message,
      screenshot: err.screenshot ? 'otp_timeout.png' : null 
    });
  } finally {
    if (browser) await browser.close();
  }
});
// STEP 2 — PAN validation
router.post('/pan', async (req, res) => {
  const { sessionId, pan } = req.body;

  if (!sessions[sessionId] || !sessions[sessionId].otpVerified) {
    return res.status(400).json({ ok: false, message: 'OTP not verified' });
  }

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
    return res.status(400).json({ ok: false, message: 'Invalid PAN format' });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://udyamregistration.gov.in/UdyamRegistration.aspx', { waitUntil: 'networkidle2' });

    // Fill PAN (adjust selector after site inspection)
    await page.type('#PanNo', pan);
    await page.click('#ValidatePanButton');
    await page.waitForTimeout(2000);

    await browser.close();

    sessions[sessionId].pan = pan;
    res.json({ ok: true, message: 'PAN validated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to validate PAN' });
  }
});

// STEP 3 — Save registration in DB
router.post('/', async (req, res) => {
  try {
    const parsed = registrationSchema.parse(req.body);

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

module.exports = router;
