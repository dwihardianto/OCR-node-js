//We declared all our imports
const { create } = require("domain");
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const { createWorker } = require("tesseract.js");

const worker = createWorker({
  logger: (m) => console.log(m), // Add logger here
});

//Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage }).single("avatar");

app.set("view engine", "ejs");

//ROUTES
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("This is your error", err);

      (async () => {
        await worker.load();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");
        // await worker.setParameters({
        //   tessedit_char_whitelist: "0123456789",
        // });
        const {
          data: { text },
        } = await worker.recognize(data);
        res.send(text);
        console.log(text);
        await worker.terminate();
      })();
    });
  });
});

//Start Up our server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Het I'm running on port ${PORT}`));
