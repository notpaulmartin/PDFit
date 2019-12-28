/* eslint-disable no-undef */
/*
 * File:          img_magic.js
 * Project:       pdfexport
 * File Created:  Sunday, 15th December 2019 3:40:08 pm
 * Author(s):     Paul Martin
 *
 * Last Modified: Friday, 27th December 2019 8:58:11 pm
 * Modified By:   Paul Martin (paul@blibspace.com)
 */

const { imageToSlices } = window;

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
 * @param {array} imgs List of image data to concat
 * @return {string} html with the concatenated image obejcts
 */
async function concatImgs(imgs = []) {
  // first slice images in half so that page breaks are more natural
  const promisedSlices = imgs.map(img => slice(img));

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
