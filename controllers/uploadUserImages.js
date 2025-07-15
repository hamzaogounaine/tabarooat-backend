const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


async function uploadLocalImageToCloudinary(imagePath, options = {}) {
  try {
    // Check if the imagePath is valid (basic check)
    if (!imagePath || typeof imagePath !== 'string') {
      console.error('Error: Invalid imagePath provided.');
      return null;
    }

    // You can add more robust file existence checks here if needed,
    // e.g., using Node's 'fs' module:
    // const fs = require('fs');
    // if (!fs.existsSync(imagePath)) {
    //   console.error(`Error: File not found at path: ${imagePath}`);
    //   return null;
    // }

    console.log(`Attempting to upload image from: ${imagePath}`);

    // Perform the upload to Cloudinary
    // The first argument is the file source. It can be a local path,
    // a remote URL, a base64 string, or a Buffer/Stream.
    const result = await cloudinary.uploader.upload(imagePath, {
      // Merge user-provided options with default ones
      folder: options.folder || 'my_uploads', // Default folder in Cloudinary
      // You can add more default options here if desired
      ...options
    });

    console.log('Image uploaded successfully!');
    console.log('Cloudinary response:', result);

    // The 'secure_url' is the HTTPS URL of the uploaded image, served via CDN.
    return result.secure_url;

  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    if (error.http_code) {
      console.error(`Cloudinary API Error: ${error.http_code} - ${error.message}`);
    }
    return null; // Return null to indicate failure
  }
}


async function runUploadExample() {
    const localImagePath = path.join(__dirname, 'image.png'); // Adjust 'test_image.jpg' to your file name
  
    // Example 1: Basic upload
    console.log('\n--- Running Basic Upload Example ---');
    const imageUrl1 = await uploadLocalImageToCloudinary(localImagePath);
  
    if (imageUrl1) {
      console.log('Uploaded image URL (Basic):', imageUrl1);
    } else {
      console.log('Basic upload failed.');
    }
  
    // Example 2: Upload with custom options (e.g., a specific folder and public_id)
    console.log('\n--- Running Upload with Options Example ---');
    const imageUrl2 = await uploadLocalImageToCloudinary(localImagePath, {
      folder: 'donation_project_images', // Custom folder
      public_id: 'donation_logo_v1',      // Custom public ID
      tags: ['donation', 'logo', 'morocco'] // Add tags
    });
  
    if (imageUrl2) {
      console.log('Uploaded image URL (with options):', imageUrl2);
    } else {
      console.log('Upload with options failed.');
    }
  
    // Example 3: Upload with a transformation applied at upload time (optional, can also be done via URL)
    console.log('\n--- Running Upload with Transformation Example ---');
    const imageUrl3 = await uploadLocalImageToCloudinary(localImagePath, {
      folder: 'transformed_images',
      transformation: [
        { width: 400, height: 300, crop: 'fill' }, // Resize to 400x300, fill area
        { effect: 'grayscale' } // Apply grayscale effect
      ]
    });
  
    if (imageUrl3) {
      console.log('Uploaded image URL (with transformation):', imageUrl3);
    } else {
      console.log('Upload with transformation failed.');
    }
  }
  

module.exports = {uploadLocalImageToCloudinary , runUploadExample}