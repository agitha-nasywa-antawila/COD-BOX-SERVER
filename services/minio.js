const Minio = require("minio");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;

// Destination Temp File
const upload = multer({ dest: "/tmp" });

const minioClient = new Minio.Client({
    endPoint: String(process.env.MINIO_END_POINT),
    port: Number(process.env.MINIO_PORT),
    useSSL: String(process.env.MINIO_SSL) == "true" ? true : false,
    accessKey: String(process.env.MINIO_ACCESS_KEY),
    secretKey: String(process.env.MINIO_SECRET_KEY),
});

async function fileUploader(fileName, filePath) {
    const fileFormat = String(fileName).split(".").at(-1);
    const objectName = `${generateRandomStringWithTimestamp()}.${fileFormat}`;

    try {
        await minioClient.fPutObject(
            BUCKET_NAME,
            objectName,
            filePath,
            (err, etag) => {
                // Membersihkan file yang di-upload terlepas dari hasilnya
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        throw ("Error cleaning up uploaded file:", unlinkErr);
                    }
                });

                if (err) {
                    console.log(err);
                    throw "Error uploading file: " + err;
                }
            }
        );

        return objectName;
    } catch (error) {
        console.log(error);
        return error;
    }
}

function generateRandomStringWithTimestamp() {
    // Generate a random string of 16 bytes and convert to hex
    const randomString = crypto.randomBytes(8).toString("hex");

    // Get the current timestamp and convert to ISO string
    const timestamp = new Date().toISOString();

    // Hash the timestamp using SHA-256 and convert to hex
    const hash = crypto.createHash("sha256").update(timestamp).digest("hex");

    // Combine the random string and hashed timestamp
    const result = `${randomString}${hash}`;

    return result;
}

module.exports = { fileUploader, upload, minioClient };
