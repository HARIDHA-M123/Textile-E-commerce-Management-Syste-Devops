const CLOUDINARY_CLOUD_NAME = 'db16hl78f'
const CLOUDINARY_UPLOAD_PRESET = 'coolbros_products'

// Upload a single image file to Cloudinary
// Returns the public URL of the uploaded image
export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', 'coolbros/products')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) throw new Error('Image upload failed')

  const data = await response.json()
  return data.secure_url
}

// Upload multiple images at once
// Returns array of URLs
export const uploadMultipleImages = async (files) => {
  const uploadPromises = Array.from(files).map(file => uploadImage(file))
  return Promise.all(uploadPromises)
}

// Get optimized image URL (auto quality + format, max width)
export const getOptimizedUrl = (url, width = 600) => {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`)
}