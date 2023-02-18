require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require('fs');

const { s3Uploadv2, s3Uploadv3 } = require("./s3Service");
const uuid = require("uuid").v4;
const app = express();


const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {  // ["image", "jpeg"]
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};


const uploadDisk = multer({ 
  storage: diskStorage, 
  fileFilter,
  limits: { fileSize: 10000, files: 2 }
});



// upload to s3 using aws sdk v2
/* app.post("/upload", uploadDisk.array('file'), async (req, res) => {
  //console.log(req.files);
  const files = req.files.map((file) => {
    return {
      name: file.filename,
      buffer: fs.readFileSync(`uploads/${file.filename}`)
    }
  });
  console.log(files);
  try {
    const results = await s3Uploadv2(files);
    //console.log(results);
    return res.json({ status: "success" });
  } catch (err) {
    console.log(err);
  }
}); */


// upload to s3 using aws sdk v2
app.post("/upload", uploadDisk.array('file'), async (req, res) => {
  //console.log(req.files);
  const files = req.files.map((file) => {
    return {
      name: file.filename,
      buffer: fs.readFileSync(`uploads/${file.filename}`)
    }
  });
  console.log(files);
  try {
    const results = await s3Uploadv3(files);
    //console.log(results);
    return res.json({ status: "success" });
  } catch (err) {
    console.log(err);
  }
});


// handling Multer error
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "file is too large",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "File limit reached",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "File must be an image",
      });
    }
  }
});

app.listen(4000, () => console.log("listening on port 4000"));
