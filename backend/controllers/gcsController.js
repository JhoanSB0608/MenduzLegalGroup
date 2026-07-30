const { Storage } = require('@google-cloud/storage');
const path = require('path');

// ============================================================
//  🔍 DIAGNÓSTICO DE CREDENCIALES GCS (visible en logs Render)
// ============================================================
console.log('=== [GCS] Iniciando configuración de credenciales ===');
console.log('[GCS] GCP_PROJECT_ID:', process.env.GCP_PROJECT_ID || '❌ NO DEFINIDO');
console.log('[GCS] GOOGLE_APPLICATION_CREDENTIALS_JSON definido:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

let storageOptions = { projectId: process.env.GCP_PROJECT_ID };

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    console.log('[GCS] Longitud del JSON de credenciales:', raw.length, 'caracteres');
    const credentials = JSON.parse(raw);
    console.log('[GCS] JSON parseado correctamente. type:', credentials.type);
    console.log('[GCS] client_email:', credentials.client_email);
    console.log('[GCS] project_id en credenciales:', credentials.project_id);
    storageOptions.credentials = credentials;
    console.log('[GCS] ✅ Credenciales cargadas desde variable de entorno');
  } catch (e) {
    console.error('[GCS] ❌ Error al parsear GOOGLE_APPLICATION_CREDENTIALS_JSON:', e.message);
  }
} else {
  const credPath = path.join(__dirname, '../credentials/menduz-legal-group-d108e85df4b2.json');
  console.log('[GCS] Usando archivo de credenciales local:', credPath);
  storageOptions.keyFilename = credPath;
}

console.log('[GCS] storageOptions.projectId:', storageOptions.projectId);
console.log('[GCS] Modo credenciales:', storageOptions.credentials ? 'ENV_VAR' : 'KEYFILE');

const storage = new Storage(storageOptions);

const bucketName = 'menduz-legal-group';
console.log('[GCS] Bucket configurado:', bucketName);
console.log('=== [GCS] Configuración completada ===');

const getUploadSignedUrl = async (req, res) => {
  const { filename, contentType } = req.body;

  console.log('\n[GCS] ▶ getUploadSignedUrl llamado');
  console.log('[GCS] filename recibido:', filename);
  console.log('[GCS] contentType recibido:', contentType);
  console.log('[GCS] Usuario autenticado:', req.user?._id || 'NO USER');

  if (!filename || !contentType) {
    console.error('[GCS] ❌ filename o contentType faltantes en el body');
    return res.status(400).json({ message: 'filename y contentType son requeridos' });
  }

  const uniqueFilename = `${Date.now()}_${filename}`;
  console.log('[GCS] uniqueFilename generado:', uniqueFilename);

  try {
    console.log('[GCS] Intentando obtener signed URL del bucket:', bucketName);
    const file = storage.bucket(bucketName).file(uniqueFilename);

    const signedUrlOptions = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType: contentType,
    };
    console.log('[GCS] Opciones de signed URL:', JSON.stringify(signedUrlOptions));

    const [signedUrl] = await file.getSignedUrl(signedUrlOptions);

    console.log('[GCS] ✅ Signed URL generada correctamente');
    console.log('[GCS] Primeros 80 chars de la URL:', signedUrl?.substring(0, 80));

    const fileUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFilename}`;
    res.status(200).json({ signedUrl, fileUrl, uniqueFilename });
  } catch (error) {
    console.error('[GCS] ❌ Error generando upload signed URL:');
    console.error('[GCS] Mensaje:', error.message);
    console.error('[GCS] Código:', error.code);
    console.error('[GCS] Stack:', error.stack);
    res.status(500).json({ message: 'Error al generar URL de subida', detail: error.message });
  }
};

const getDownloadSignedUrl = async (req, res) => {
  const { filename } = req.query;

  console.log('\n[GCS] ▶ getDownloadSignedUrl llamado');
  console.log('[GCS] filename:', filename);

  try {
    const file = storage.bucket(bucketName).file(filename);
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000,
    });

    console.log('[GCS] ✅ Download signed URL generada correctamente');
    res.status(200).json({ signedUrl });
  } catch (error) {
    console.error('[GCS] ❌ Error generando download signed URL:');
    console.error('[GCS] Mensaje:', error.message);
    console.error('[GCS] Código:', error.code);
    console.error('[GCS] Stack:', error.stack);
    res.status(500).json({ message: 'Error al generar URL de descarga', detail: error.message });
  }
};

const serveImage = async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ message: 'URL param required' });
  }

  try {
    const prefix = 'https://storage.googleapis.com/';
    if (!url.startsWith(prefix)) {
      return res.status(400).json({ message: 'Invalid GCS URL' });
    }
    const afterPrefix = url.slice(prefix.length);
    const idx = afterPrefix.indexOf('/');
    const bucket = idx === -1 ? afterPrefix : afterPrefix.slice(0, idx);
    const filename = idx === -1 ? '' : decodeURIComponent(afterPrefix.slice(idx + 1));

    const [buffer] = await storage.bucket(bucket).file(filename).download();
    const contentType = req.query.contentType || 'image/png';

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (error) {
    console.error('[GCS] Error serving image:', error.message);
    res.status(500).json({ message: 'Error serving image', detail: error.message });
  }
};

module.exports = { getUploadSignedUrl, getDownloadSignedUrl, serveImage };
