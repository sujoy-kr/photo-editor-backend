const path = require("path");
const fs = require("fs");

const removeFile = (file) => {
    let fileUrl;
    if(typeof file === 'string'){
        fileUrl = file
    } else if(file && file.path){
        fileUrl = file.path
    }

    if (fileUrl) {
        const filePath = path.resolve(fileUrl);

        // Delete file from filesystem
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

module.exports = removeFile