require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require('fs');
const commonEvents = require('./commonEvents');
const commonEmitter = commonEvents.commonEmitter;
const uploadHandler = require('./uploadHandler');
const uuid = require("uuid").v4;
const app = express();

// set the destination and file name
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
  },
});

// set multer filteration
const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {  // ["image", "jpeg"]
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

// intiate multer 
const uploadDisk = multer({ 
  storage: diskStorage, 
  fileFilter,
  limits: { fileSize: 10000, files: 2 }
});

// Prepare listners
commonEmitter.on('upload-images', (files) => {
  uploadHandler.handlerv3(files);
  // uploadHandler.handlerv2(files);
});

// upload locally and fire event
app.post("/upload", uploadDisk.array('file'), async (req, res) => {
  const files = await req.files.map((file) => {
    file.buffer = fs.readFileSync(`uploads/${file.filename}`);
    return file
  });
  commonEmitter.emit('upload-images', files);
  return res.json({status:"success"});
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
