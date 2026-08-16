const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

exports.uploadImage = async (req, res) => {
  console.log("========== STEP 4 ==========");
  console.log("Controller reached");

  try {
    console.log("Request File:", req.file);

    if (!req.file) {
      console.log("No file received!");

      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    console.log("Uploading to Cloudinary...");

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "mini-social-media",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Error:", error);
              return reject(error);
            }

            console.log("Cloudinary Upload Success!");
            resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    console.log("Upload Complete:");
    console.log(result.secure_url);

    return res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });

  } catch (error) {
    console.error("========== UPLOAD ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};