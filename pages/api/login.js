import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (username === adminUser && password === adminPass) {
    // Generate a simple token (in production use JWT or similar)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    const cookie = serialize('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'lax',
    });
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
}