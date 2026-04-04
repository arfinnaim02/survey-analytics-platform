import { getAllResponses } from '../../lib/db';
import cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.admin_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const responses = await getAllResponses();
    // Convert to CSV
    const headers = Object.keys(responses[0] || {});
    const rows = responses.map(resp => headers.map(h => JSON.stringify(resp[h] != null ? resp[h] : '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="responses.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to export data' });
  }
}