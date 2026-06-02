
const API_URL = process.env.REACT_APP_BACKEND_URL;
console.log("fileStorageService API_URL:", API_URL);

/**
 * Requests a signed URL from the backend for uploading a file to GCS,
 * then uploads the file directly to GCS using a PUT request.
 * @param {File} file The file to upload.
 * @returns {Promise<{fileUrl: string, uniqueFilename: string}>} A promise that resolves with the URL and the unique filename of the uploaded file.
 */
const getToken = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo).token : null;
};

export const uploadFile = async (file) => {
  if (!API_URL) throw new Error("REACT_APP_BACKEND_URL is not defined.");
  const token = getToken();

  try {
    const response = await fetch(`${API_URL}/api/gcs/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!response.ok) throw new Error(`Failed to get signed URL: ${response.statusText}`);

    const { signedUrl, fileUrl, uniqueFilename } = await response.json();

    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!uploadResponse.ok) throw new Error(`Failed to upload file to GCS: ${uploadResponse.statusText}`);

    return { fileUrl, uniqueFilename };
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
};

export const downloadFile = async (filename) => {
  if (!API_URL) throw new Error("REACT_APP_BACKEND_URL is not defined.");
  const token = getToken();
  const requestUrl = `${API_URL}/api/gcs/download-url?filename=${encodeURIComponent(filename)}`;

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`Failed to get signed URL for download: ${response.statusText}`);

    const { signedUrl } = await response.json();
    window.open(signedUrl, '_blank');
  } catch (error) {
    console.error('Error in downloadFile:', error);
    throw error;
  }
};
