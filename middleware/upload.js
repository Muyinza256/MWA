const multer = require('multer');

module.exports = multer({limits:{fileSize:10 * 1024 * 1024}});