/*
 * File:          img_magic.js
 * Project:       pdfexport
 * File Created:  Sunday, 15th December 2019 3:40:08 pm
 * Author(s):     Paul Martin
 *
 * Last Modified: Wednesday, 22nd April 2020 5:03:04 pm
 * Modified By:   Paul Martin
 */

const { imageToSlices } = window;

// area at top and bottom of screen to not include in screenshots (e.g. navbar)
const marginTop = 150;
const marginBottom = 50;

imgs2pdf = (shots) => {
  // eslint-disable-next-line new-cap
  const doc = new jsPDF('p', 'mm');
  shots.forEach((imgData) => {
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
  const html = imgs
    .map((dataURI) => `<img src="${dataURI}" width="100%">`) // convert to simple html object
    .join('\n'); // concat array of html objects to string

  return html;
}

/**
 * Slices a list of image dataURIs horizontally into multiple images, to fit them better on A4 pages
 * @param {[]string} imgs List of image data to slice (As dataURIs)
 */
async function sliceImgs(imgs = []) {
  // Slice images
  const promisedSlices = imgs.map((img) => slice(img));

  // Wait for slicing to complete
  const slicedImgs = (await Promise.all(promisedSlices))
    .flat() // flatten from [ [{},{}], ... ] to [ {}, ... ]
    .map((obj) => obj.dataURI); // extract only the image data

  return slicedImgs;
}

const slice = (imgDataURI) =>
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
          middleBoundaryMode: true,
        },
        (dataURIList) => {
          resolve(dataURIList);
        }
      );
    };
  });

/**
 * Trims a list of image dataURIs to get rid of unwanted parts at the top and bottom of the page (e.g. navbar)
 * @param {string} imgs List of image data to trim (As dataURIs)
 * @param {int} pageHeight Height of entire webpage (pixels)
 * @param {int} viewportHeight Height of viewport (pixels)
 */
async function trimImgs(imgs = [], pageHeight, viewportHeight) {
  const devicePixelRatio = window.devicePixelRatio;

  let trimmedImgs;

  if (imgs.length > 1) {
    // (More than one screenshots)

    // trim all images except first and last (remove top and bottom -> navbar & other fixed elements)
    const promisedTrims = imgs
      .slice(1, imgs.length - 1)
      .map((img) =>
        trim(img, { top: marginTop, bottom: marginBottom }, devicePixelRatio)
      );

    // First image: don't trim top
    promisedTrims.unshift(
      trim(imgs[0], { bottom: marginBottom }, devicePixelRatio)
    );

    // Last image: don't trim bottom; remove overlap with second-to-last image
    const trimmedPageHeight = pageHeight - marginTop - marginBottom;
    const trimmedViewportHeight = viewportHeight - marginTop - marginBottom;
    const lastImgOverlap =
      trimmedViewportHeight - (trimmedPageHeight % trimmedViewportHeight);

    promisedTrims.push(
      trim(
        imgs[imgs.length - 1],
        { top: marginTop + lastImgOverlap },
        devicePixelRatio
      )
    );

    // wait for trimming to complete
    trimmedImgs = await Promise.all(promisedTrims);
  } else {
    // (Only one screenshot)
    trimmedImgs = imgs;
  }

  return trimmedImgs;
}

/**
 * Trims the specified amount of pixels from each side of the image, shrinking it
 *
 * @param {string} dataURI - Image to crop
 * @param {object} {top, bottom, left, right}
 */
function trim(
  dataURI,
  { top = 0, bottom = 0, left = 0, right = 0 } = {},
  devicePixelRatio = 1
) {
  // Number of css pixels doesn't always exactly correspond to number of actual pixels
  top *= devicePixelRatio;
  bottom *= devicePixelRatio;
  left *= devicePixelRatio;
  right *= devicePixelRatio;

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

/**
 * Cuts out a section of the image.
 * The area is defined by its distance to the original's top, bottom, left and right borders.
 * @param {string} dataURI - Image to crop
 * @param {object} {top, bottom, left, right}
 */
function cut(dataURI, { top = 0, bottom = 0, left = 0, right = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const inputImage = new Image();
    const outputImageCanvas = document.createElement('canvas');
    inputImage.src = dataURI;

    inputImage.onload = () => {
      outputImageCanvas.height = bottom - top || inputImage.height;
      outputImageCanvas.width = right - left || inputImage.width;

      const ctx = outputImageCanvas.getContext('2d');
      ctx.drawImage(inputImage, -left, -top);

      resolve(outputImageCanvas.toDataURL());
    };
  });
}
