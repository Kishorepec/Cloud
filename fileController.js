// controllers/fileController.js
const s3 = require("../config/awsConfig");
const crypto = require("crypto");

const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const encryptionKey = process.env.ENCRYPTION_KEY;

    // Encrypt the file (optional)
    const cipher = crypto.createCipher("aes-256-cbc", encryptionKey);
    const encryptedData = Buffer.concat([cipher.update(file.buffer), cipher.final()]);

    // Prepare S3 upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.originalname, // You might want to change this to ensure uniqueness
      Body: encryptedData,
      ContentType: file.mimetype,
    };

    // Upload the file to S3
    const data = await s3.upload(uploadParams).promise();
    res.status(200).json({ message: "File uploaded successfully!", url: data.Location });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const fileName = req.params.filename;
    const encryptionKey = process.env.ENCRYPTION_KEY;

    const downloadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    };

    // Retrieve the file from S3
    const fileData = await s3.getObject(downloadParams).promise();

    // Decrypt the file
    const decipher = crypto.createDecipher("aes-256-cbc", encryptionKey);
    const decryptedData = Buffer.concat([decipher.update(fileData.Body), decipher.final()]);

    res.setHeader("Content-Type", fileData.ContentType);
    res.send(decryptedData);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: error.message });
  }
};
const listFiles = async (req, res) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      // Optionally, you can specify a Prefix here if you have organized files in folders
    };

    // List objects in the bucket
    const data = await s3.listObjectsV2(params).promise();

    // Map the S3 Contents array to an array of file names
    const files = data.Contents.map(file => file.Key);

    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { uploadFile, downloadFile, listFiles };
