const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/har`, {
  method: 'POST',
  body: formData,
});
