const cloudinary = require("cloudinary").v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName) {
  console.error("❌ CLOUDINARY_CLOUD_NAME is missing");
}

if (!apiKey) {
  console.error("❌ CLOUDINARY_API_KEY is missing");
}

if (!apiSecret) {
  console.error("❌ CLOUDINARY_API_SECRET is missing");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

console.log("====================================");
console.log("☁️ Cloudinary Configuration");
console.log("Cloud Name:", cloudName ? "LOADED" : "MISSING");
console.log("API Key:", apiKey ? "LOADED" : "MISSING");
console.log("API Secret:", apiSecret ? "LOADED" : "MISSING");
console.log("====================================");

module.exports = cloudinary;