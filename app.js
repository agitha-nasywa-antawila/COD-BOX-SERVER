if (process.env.NODE_ENV !== "PRODUCTION") require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;
const ROUTER = require("./router");
const { fileUploader, minioClient, upload } = require("./services/minio");

app.set("views", "views");
app.set("view engine", "hbs");
app.set("view options", { layout: "layouts/layout" });
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static("public"));
app.use("/static", express.static("public"));
app.use("/", ROUTER);

app.get("/public/img/:fileName", async (req, res) => {
    const bucketName = process.env.MINIO_BUCKET_NAME;
    const objectName = req.params.fileName;

    // Generate pre-signed URL untuk download file
    const expiry = 1 * 60 * 60; // URL valid selama 1 jam
    minioClient.presignedGetObject(
        bucketName,
        objectName,
        expiry,
        (err, presignedUrl) => {
            if (err) {
                console.error("Error generating presigned URL:", err);
                return res
                    .status(500)
                    .send("Error generating presigned URL: " + err.message);
            }

            console.log(presignedUrl);
            const forceHttp = presignedUrl.replace(/^https:\/\//, "http://");

            return res.redirect(forceHttp);
        }
    );
});

app.listen(PORT, () => {
    console.log(`🚀 SERVER RUNNING IN PORT ${PORT}`);
});
