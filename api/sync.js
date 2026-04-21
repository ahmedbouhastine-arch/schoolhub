import dbConnect from './lib/mongodb.js';
import SchoolData from './models/SchoolData.js';

export default async function handler(req, res) {
  await dbConnect();

  const { key: queryKey } = req.query;

  if (req.method === 'GET') {
    try {
      if (queryKey) {
        const item = await SchoolData.findOne({ key: queryKey });
        return res.status(200).json(item ? item.data : null);
      }
      
      const allData = await SchoolData.find({});
      const dict = {};
      allData.forEach(item => {
        dict[item.key] = item.data;
      });
      return res.status(200).json(dict);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const updates = req.body;
      
      const ops = Object.keys(updates).map(key => {
        return SchoolData.findOneAndUpdate(
          { key },
          { key, data: updates[key] },
          { upsert: true, new: true }
        );
      });

      await Promise.all(ops);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
