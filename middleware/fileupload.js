const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads");
  },
  filename: function (req, image, callback) {
    callback(null, Date.now() + "-" + image.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
