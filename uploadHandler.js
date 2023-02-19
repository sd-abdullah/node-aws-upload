const { s3Uploadv2, s3Uploadv3 } = require("./s3Service");


let uploadNotDone = [];


exports.handlerv3 = async (files) => { 
    uploadNotDone.push(...files);
    try {
    await s3Uploadv3(uploadNotDone);
    const filesToDelete = new Set(files);
    uploadNotDone = uploadNotDone.filter((file) => {
        return !filesToDelete.has(file);
    }) 
    console.log("upload success");
  } catch (err) {
    console.log(err);
  }
}; 


exports.handlerv2 = async (files) => {  
    uploadNotDone.push(...files);
    console.log(uploadNotDone);
    try {
    await s3Uploadv2(uploadNotDone);
    const filesToDelete = new Set(files);
    uploadNotDone = uploadNotDone.filter((file) => {
        return !filesToDelete.has(file);
    }) 
    console.log("upload success");
  } catch (err) {
    console.log(err);
  }
}; 