import { Storage } from '@google-cloud/storage';

// Singleton storage client
let storage;
let bucket;

function initGCS() {
  const PROJECT_ID = process.env.GCP_PROJECT_ID;
  const CLIENT_EMAIL = process.env.GCP_CLIENT_EMAIL;
  const PRIVATE_KEY = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const BUCKET_NAME = process.env.GCS_BUCKET_NAME;

  if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY || !BUCKET_NAME) {
    throw new Error('Missing GCS environment variables (GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY, or GCS_BUCKET_NAME)');
  }

  if (!storage) {
    storage = new Storage({
      projectId: PROJECT_ID,
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      }
    });
    bucket = storage.bucket(BUCKET_NAME);
  }
}

/**
 * Save data as a JSON file in the bucket
 */
export async function saveFile(key, data) {
  initGCS();
  if (!bucket) throw new Error('GCS Bucket not initialized');
  
  const file = bucket.file(`data/${key}.json`);
  const content = JSON.stringify(data, null, 2);
  
  await file.save(content, {
    contentType: 'application/json',
    resumable: false, // Better for small files
  });
}

/**
 * Load data from a JSON file in the bucket
 */
export async function loadFile(key) {
  initGCS();
  if (!bucket) throw new Error('GCS Bucket not initialized');

  const file = bucket.file(`data/${key}.json`);
  
  try {
    const [content] = await file.download();
    return JSON.parse(content.toString());
  } catch (err) {
    // If file doesn't exist, return null gracefully
    if (err.code === 404) return null;
    throw err;
  }
}

/**
 * Load all JSON files in the data/ directory
 */
export async function loadAllFiles() {
  initGCS();
  if (!bucket) throw new Error('GCS Bucket not initialized');

  const [files] = await bucket.getFiles({ prefix: 'data/' });
  const results = {};

  const promises = files.map(async (file) => {
    if (!file.name.endsWith('.json')) return;
    
    try {
      const [content] = await file.download();
      const key = file.name.replace('data/', '').replace('.json', '');
      results[key] = JSON.parse(content.toString());
    } catch (e) {
      console.warn(`Failed to parse file ${file.name}:`, e);
    }
  });

  await Promise.all(promises);
  return results;
}
