import { loadFile, loadAllFiles, saveFile } from './lib/gcs.js';

export default async function handler(req, res) {
  const { key: queryKey } = req.query;

  // GET: Fetch one file or all files as a dictionary
  if (req.method === 'GET') {
    try {
      if (queryKey) {
        const data = await loadFile(queryKey);
        return res.status(200).json(data);
      }
      
      const allData = await loadAllFiles();
      return res.status(200).json(allData);
    } catch (error) {
      console.error('API GET error:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch data' });
    }
  }

  // POST: Save one or more JSON files
  if (req.method === 'POST') {
    try {
      const updates = req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Body must be an object' });
      }

      const ops = Object.keys(updates).map(key => saveFile(key, updates[key]));
      await Promise.all(ops);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('API POST error:', error);
      return res.status(500).json({ error: error.message || 'Failed to save data' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
