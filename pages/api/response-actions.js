import cookie from 'cookie';
import { pool } from '../../lib/db';

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'PATCH') {
      const { id, ids, is_reviewed } = req.body;

      if (typeof is_reviewed !== 'boolean') {
        return res.status(400).json({ error: 'Invalid review status' });
      }

      if (Array.isArray(ids) && ids.length > 0) {
        const { rows } = await pool.query(
          'UPDATE responses SET is_reviewed = $1 WHERE id = ANY($2::int[]) RETURNING *;',
          [is_reviewed, ids]
        );
        return res.status(200).json({ success: true, data: rows });
      }

      if (!id) {
        return res.status(400).json({ error: 'Missing id or ids' });
      }

      const { rows } = await pool.query(
        'UPDATE responses SET is_reviewed = $1 WHERE id = $2 RETURNING *;',
        [is_reviewed, id]
      );

      return res.status(200).json({ success: true, data: rows[0] });
    }

    if (req.method === 'DELETE') {
      const { id, ids } = req.body;

      if (Array.isArray(ids) && ids.length > 0) {
        const { rows } = await pool.query(
          'DELETE FROM responses WHERE id = ANY($1::int[]) RETURNING id;',
          [ids]
        );
        return res.status(200).json({ success: true, data: rows });
      }

      if (!id) {
        return res.status(400).json({ error: 'Missing id or ids' });
      }

      const { rows } = await pool.query(
        'DELETE FROM responses WHERE id = $1 RETURNING id;',
        [id]
      );

      return res.status(200).json({ success: true, data: rows[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Action failed' });
  }
}