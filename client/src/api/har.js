const onUploadHAR = async (file) => {
  try {
    const formData = new FormData();
    formData.append('har', file); // the key must match backend field

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/har`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload HAR file.');
    }

    const data = await response.json();
    console.log('Uploaded HAR response:', data);
    // Optionally, update your state or UI with the response
  } catch (err) {
    console.error('Upload error:', err.message);
    // Optionally, show error to user
  }
};
