const https = require('https');
const http = require('http');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

let storageOptions = { projectId: process.env.GCP_PROJECT_ID };

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    storageOptions.credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  } catch (e) {
    console.error('[imageHelper] Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:', e.message);
  }
} else {
  const credPath = path.join(__dirname, '../credentials/menduz-legal-group-d108e85df4b2.json');
  storageOptions.keyFilename = credPath;
}

const storage = new Storage(storageOptions);

const GCS_PREFIX = 'https://storage.googleapis.com/';

function parseGcsUrl(url) {
  const afterPrefix = url.slice(GCS_PREFIX.length);
  const idx = afterPrefix.indexOf('/');
  const bucket = idx === -1 ? afterPrefix : afterPrefix.slice(0, idx);
  const filename = idx === -1 ? '' : afterPrefix.slice(idx + 1);
  return { bucket, filename };
}

async function fetchImageAsBase64(url) {
  if (url.startsWith(GCS_PREFIX)) {
    try {
      const { bucket, filename } = parseGcsUrl(url);
      const [buffer] = await storage.bucket(bucket).file(filename).download();
      return `data:image/png;base64,${buffer.toString('base64')}`;
    } catch (err) {
      console.error(`[imageHelper] GCS download failed for ${url}:`, err.message);
      throw err;
    }
  }

  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode} fetching image`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || 'image/png';
        resolve(`data:${contentType};base64,${buffer.toString('base64')}`);
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = { fetchImageAsBase64 };
