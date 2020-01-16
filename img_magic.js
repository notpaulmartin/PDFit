/*
 * File:          img_magic.js
 * Project:       pdfexport
 * File Created:  Sunday, 15th December 2019 3:40:08 pm
 * Author(s):     Paul Martin
 *
 * Last Modified: Thursday, 16th January 2020 5:11:04 pm
 * Modified By:   Paul Martin (paul@blibspace.com)
 */

const { imageToSlices } = window;

// area at top and bottom of screen to not include in screenshots (e.g. navbar)
const marginTop = 150;
const marginBottom = 150;

imgs2pdf = shots => {
  // eslint-disable-next-line new-cap
  const doc = new jsPDF('p', 'mm');
  shots.forEach(imgData => {
    doc.addImage(imgData, 'PNG', 15, 40, 180, 160);
  });
  return doc;
};

/**
 * Converts a list of image dataURIs to html
 *
 * @param {array} imgs List of image data to concat
 * @return {string} html with the concatenated image obejcts
 */
async function concatImgs(imgs = []) {
  // first slice images in half so that page breaks are more natural

  // first trim images (remove top and bottom -> navbar & other fixed elements)
  const promisedTrims = imgs.map(img =>
    trim(img, { top: marginTop, bottom: marginBottom })
  );
  const trimmedImgs = await Promise.all(promisedTrims);

  // then slice them to better fit them on A4 pages
  const promisedSlices = trimmedImgs.map(img => slice(img));
  const slicedImgs = (await Promise.all(promisedSlices)) // slice all images simultaneously
    .flat() // flatten from [ [{},{}], ... ] to [ {}, ... ]
    .map(obj => obj.dataURI); // extract only the image data

  const html = slicedImgs
    .map(dataURI => `<img src="${dataURI}" width="100%">`) // convert to simple html object
    .join('\n'); // concat array of html objects to string

  return html;
}

const slice = imgDataURI =>
  new Promise((resolve, reject) => {
    const imgObj = new Image();
    imgObj.src = imgDataURI;
    imgObj.onload = () => {
      imageToSlices(
        imgDataURI,
        [imgObj.height / 2],
        [],
        {
          saveToDataUrl: true,
          middleBoundaryMode: true
        },
        dataURIList => {
          resolve(dataURIList);
        }
      );
    };
  });

/**
 * Trims the specified amount of pixels from each side of the image, shrinking it
 *
 * @param {string} dataURI - Image to crop
 * @param {object} {top, bottom, left, right}
 */
function trim(dataURI, { top = 0, bottom = 0, left = 0, right = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const inputImage = new Image();
    const outputImageCanvas = document.createElement('canvas');
    inputImage.src = dataURI;

    inputImage.onload = () => {
      outputImageCanvas.height = inputImage.height - top - bottom;
      outputImageCanvas.width = inputImage.width - left - right;

      const ctx = outputImageCanvas.getContext('2d');
      ctx.drawImage(inputImage, -left, -top);

      resolve(outputImageCanvas.toDataURL());
    };
  });
}
