import { saveResponse } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const data = req.body;
    // Basic validation: ensure respondent_type and location exist
    if (!data.respondent_type || !data.location) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const saved = await saveResponse(data);
    return res.status(201).json({ id: saved.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save response' });
  }
}