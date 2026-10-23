import { createHash, randomInt } from 'node:crypto';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { query } from '../../db/pool';
import { ApiError } from '../../errors';
import { requestOtpSchema, verifyOtpSchema } from './validation';

const router = Router();
const hashOtp = (otp: string) => createHash('sha256').update(`${otp}:${env.jwtSecret}`).digest('hex');
const generateOtp = () => String(randomInt(0, 1_000_000)).padStart(6, '0');

router.post('/request-otp', async (req, res, next) => {
  try {
    const { phone } = requestOtpSchema.parse(req.body);
    const otp = generateOtp();
    await query('INSERT INTO otp_challenges (phone, otp_hash, expires_at) VALUES ($1, $2, NOW() + ($3 * INTERVAL \'1 minute\'))', [phone, hashOtp(otp), env.otpTtlMinutes]);
    if (env.nodeEnv !== 'production') console.log(`Mock OTP for ${phone}: ${otp}`);
    res.json({ message: 'If the phone number is valid, an OTP has been generated.' });
  } catch (error) { next(error); }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    const challenge = await query<{ id: string }>(
      'SELECT id FROM otp_challenges WHERE phone = $1 AND otp_hash = $2 AND consumed_at IS NULL AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [phone, hashOtp(otp)],
    );
    if (!challenge.rowCount) throw new ApiError(401, 'INVALID_OTP', 'The OTP is invalid, expired, or already used.');
    const consumed = await query('UPDATE otp_challenges SET consumed_at = NOW() WHERE id = $1 AND consumed_at IS NULL', [challenge.rows[0].id]);
    if (!consumed.rowCount) throw new ApiError(401, 'INVALID_OTP', 'The OTP is invalid, expired, or already used.');
    const user = await query<{ id: string; phone: string }>(
      'INSERT INTO users (phone) VALUES ($1) ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone RETURNING id, phone', [phone],
    );
    const currentUser = user.rows[0];
    const token = jwt.sign({}, env.jwtSecret, { subject: currentUser.id, expiresIn: '7d' });
    res.json({ token, user: currentUser });
  } catch (error) { next(error); }
});

export default router;
