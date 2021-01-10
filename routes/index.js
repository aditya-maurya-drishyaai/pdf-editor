const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const {degrees, PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const directory = path.join(__dirname, "../public/images/pnid.pdf");
console.log(__dirname)
// fs.readdir(directory, (err, files) => {
//   if (err) {
//     console.log("Unable to find directory!!!");
//   } else {
//     files.forEach((file) => {
//       console.log(file);
//     });
//   }
// });

async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath);
    console.log(data.toString());
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}
// fs.readFile(
//   "./public/images/pic1.jpeg",
//   "utf8",
//   function (err, data) {
//     if (err) {
//       return console.log(err);
//     }
//     jpgImageBytes = Buffer.from(data,'base64');
//     console.log(typeof jpgImageBytes)
//   }
// );
// fs.readFile(
//   "./public/images/pic2.jpeg",
//   "utf8",
//   function (err, data) {
//     if (err) {
//       return console.log(err);
//     }
//     pngImageBytes=  Buffer.from(data,'base64');
//   }
// );

const createPdf = () => {
  return new Promise(async (resolve) => {
    const pdfDoc = await PDFDocument.create();
    const jpgUrl = "https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg";
    const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer());

    // Fetch PNG image
    const pngUrl = "https://pdf-lib.js.org/assets/minions_banana_alpha.png";
    const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    // Embed the JPG image bytes and PNG image bytes
    const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    // Get the width/height of the JPG image scaled down to 25% of its original size
    const jpgDims = jpgImage.scale(0.25);

    // Get the width/height of the PNG image scaled down to 50% of its original size
    const pngDims = pngImage.scale(0.5);

    // Add a blank page to the document
    const page = pdfDoc.addPage();

    // Get the width and height of the page
    const { width, height } = page.getSize();

    // Draw a string of text toward the top of the page
    const fontSize = 30;
    page.drawText("Creating PDFs in JavaScript is awesome!", {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0.53, 0.71),
    });
    page.drawImage(jpgImage, {
      x: page.getWidth() / 2 - jpgDims.width / 2,
      y: page.getHeight() / 2 - jpgDims.height / 2,
      width: jpgDims.width,
      height: jpgDims.height,
    });
    page.drawImage(pngImage, {
      x: page.getWidth() / 2 - pngDims.width / 2 + 75,
      y: page.getHeight() / 2 - pngDims.height,
      width: pngDims.width,
      height: pngDims.height,
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    resolve(await pdfDoc.save());
  });
};

const modifyPdf = () => {
  let pdfFile;
  console.log("inside modify pdf");
  fs.readFile(directory, "base64", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Success");
      pdfFile = data;
    }
  });
  console.log("after fs read");
  return new Promise(async (resolve) => {
    console.log("inside promise");
    const url = "https://pdf-lib.js.org/assets/with_update_sections.pdf";
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfFile);

    console.log("after loading of pdf");
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    firstPage.drawText("This text was added with JavaScript!", {
      x: 5,
      y: height / 2 + 300,
      size: 50,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1),
      rotate: degrees(-45),
    });

    resolve(await pdfDoc.save());
    console.log("after resolve");
  });
};
/* GET home page. */
router.get("/", async function (req, res, next) {
  console.log("inside index");

  const val = await modifyPdf();
  res.attachment("report.pdf");
  res.send(Buffer.from(val, "base64"));
});

module.exports = router;
