const { z } = require('zod');

// Basic regex rules matching common Udyam validation patterns
const aadhaarRegex = /^\d{12}$/; // 12 digits
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i; // e.g., ABCDE1234F
const mobileRegex = /^[6-9]\d{9}$/; // India 10 digits starting 6-9

const registrationSchema = z.object({
  aadhaar: z.string().regex(aadhaarRegex, 'Aadhaar must be 12 digits'),
  pan: z.string().optional().nullable().refine((v) => {
    if (!v || v === '') return true; // optional
    return panRegex.test(v);
  }, { message: 'PAN must match pattern ABCDE1234F' }),
  applicantName: z.string().min(1, 'Applicant name required'),
  mobile: z.string().optional().nullable().refine((v) => {
    if (!v || v === '') return true;
    return mobileRegex.test(v);
  }, { message: 'Invalid mobile number' }),
  email:z.string().email('Invalid email').optional().nullable(),
  enterpriseName: z.string().optional().nullable(),
  enterpriseType: z.string().optional().nullable(),
  businessActivity: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  pincode: z.string().optional().nullable().refine((v) => {
    if (!v || v === '') return true;
    return /^\d{6}$/.test(v);
  }, { message: 'Pincode must be 6 digits' }),
  otpVerified: z.boolean().optional()
});

module.exports = {
  registrationSchema,
  aadhaarRegex,
  panRegex,
  mobileRegex
};
