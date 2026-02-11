const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary for image storage
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
const uploadImage = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'ecommerce',
      ...options,
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary upload error: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} filePaths - Array of file paths to upload
 * @param {object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleImages = async (filePaths, options = {}) => {
  try {
    const uploadPromises = filePaths.map((filePath) =>
      uploadImage(filePath, options)
    );
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Cloudinary multiple upload error: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<object>} Delete result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete error: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of public IDs to delete
 * @returns {Promise<Array>} Array of delete results
 */
const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((publicId) => deleteImage(publicId));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    throw new Error(`Cloudinary multiple delete error: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
};
