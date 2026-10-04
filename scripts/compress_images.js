const sharp = require('sharp');
const glob = require('glob');
const fs = require('fs');
const path = require('path');

const run = async () => {
    console.log("Starting image compression...");
    const files = glob.sync('public/photos/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}');
    
    for (const file of files) {
        const ext = path.extname(file);
        const tmpFile = file.replace(ext, '_tmp' + ext);
        try {
            console.log('Compressing', file);
            await sharp(file)
                .resize({ width: 1200, withoutEnlargement: true })
                .jpeg({ quality: 70, force: false })
                .png({ quality: 70, force: false })
                .webp({ quality: 70, force: false })
                .toFile(tmpFile);
            
            fs.renameSync(tmpFile, file);
        } catch (e) {
            console.error('Failed to compress', file, e);
            if (fs.existsSync(tmpFile)) {
                fs.unlinkSync(tmpFile);
            }
        }
    }
    console.log("Finished compressing images.");
};

run();
