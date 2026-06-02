const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Configuración del storage.
const storage = new Storage({
  keyFilename: path.join(__dirname, '../credentials/menduz-legal-group-d108e85df4b2.json'),
  projectId: process.env.GCP_PROJECT_ID,
});

const bucketName = 'menduz-legal-group';

const getUploadSignedUrl = async (req, res) => {
  const { filename, contentType } = req.body;
  const uniqueFilename = `${Date.now()}_${filename}`;

  try {
    const file = storage.bucket(bucketName).file(uniqueFilename);
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutos
      contentType: contentType,
    });

    res.status(200).json({ signedUrl, fileUrl: `https://storage.googleapis.com/${bucketName}/${uniqueFilename}`, uniqueFilename });
  } catch (error) {
    console.error('Error generating upload signed URL:', error);
    res.status(500).json({ message: 'Error al generar URL de subida' });
  }
};

const getDownloadSignedUrl = async (req, res) => {
  const { filename } = req.query;

  try {
    const file = storage.bucket(bucketName).file(filename);
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutos
    });

    res.status(200).json({ signedUrl });
  } catch (error) {
    console.error('Error generating download signed URL:', error);
    res.status(500).json({ message: 'Error al generar URL de descarga' });
  }
};

module.exports = { getUploadSignedUrl, getDownloadSignedUrl };
