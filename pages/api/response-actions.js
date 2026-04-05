import cookie from 'cookie';
import { updateResponseReviewStatus, deleteResponseById } from '../../lib/db';

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'PATCH') {
      const { id, is_reviewed } = req.body;

      if (!id || typeof is_reviewed !== 'boolean') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      const updated = await updateResponseReviewStatus(id, is_reviewed);
      return res.status(200).json({ success: true, data: updated });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      const deleted = await deleteResponseById(id);
      return res.status(200).json({ success: true, data: deleted });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Action failed' });
  }
}