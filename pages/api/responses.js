import { getAllResponses } from '../../lib/db';
import cookie from 'cookie';

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Check auth cookie
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.admin_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const responses = await getAllResponses();
    return res.status(200).json({ data: responses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch responses' });
  }
}