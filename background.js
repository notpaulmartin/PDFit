/*
 * File:          background.js
 * Project:       PDFme
 * File Created:  Saturday, 14th December 2019 3:18:59 pm
 * Author(s):     Paul Martin, Alexandra Purcarea
 *
 * Last Modified: Wednesday, 22nd April 2020 5:05:39 pm
 * Modified By:   Paul Martin
 */

/**
 * Called when the user clicks on the browser action (extension button in the menu bar).
 * @param {chrome-tab} tab
 */
async function main(tab) {
  // position the user was initially at, to scroll to
  const initialScrollPosition = await sendToContentJS(
    'initial_scroll_position'
  );

  const vh = await sendToContentJS('viewport_height');
  const pageHeight = await sendToContentJS('page_height');
  const devicePixelRatio = await sendToContentJS('device_pixel_ratio');
  // const scrollAmount = vh - (marginTop + marginBottom) / 2;
  const scrollAmount = vh - marginTop - marginBottom;

  // hide scrollbar
  sendToContentJS('hide_scrollbar');

  // the array containing the individual screenshots
  const screenshots = [];

  const screenshotLoop = (response) =>
    new Promise((resolve, reject) => {
      switch (response) {
        case 'scrolled':
          sleep(40);
          takeScreenshot()
            .then((imgData) => {
              // add screenshot to list
              screenshots.push(imgData);
            })
            .then(() => {
              // scroll down again
              sendToContentJS('scroll_down', scrollAmount)
                .then(screenshotLoop) // recursively
                .then(resolve); // iterate base case back to beginning
            });
          break;
        case 'at_bottom': // base case
          // revert to initial state
          sendToContentJS('unhide_scrollbar');
          sendToContentJS('scroll_to_position', initialScrollPosition);
          resolve(screenshots);
          break;
        default:
          break;
      }
    });

  sendToContentJS('scroll_to_top')
    .then(screenshotLoop)
    .then((imgDatas) => trimImgs(imgDatas, pageHeight, vh)) // convert image data to html
    .then(sliceImgs) // slice images in half so they better fit on an A4 sheet
    .then(concatImgs) // convert image data to html
    .then(printHtml); // open in pop-up and open print dialogue
}

/**
 * Open a new window with the html contents and opens the print dialogue. Can be used to save as a pdf
 * @param {string} imgsHtml
 */
function printHtml(imgsHtml) {
  // display the html in a new window
  const w = window.open('', 'imgWindow', 'width=800,height=600');
  w.document.write(imgsHtml);
  w.focus();
  setTimeout(() => {
    w.print();
  }, 1000);
  // TODO: uncomment
  w.onafterprint = () => {
    w.close();
  };
}

/**
 * A function to send data to and receive from content.js
 *
 * @param {string} message The name under which the data is passed to content.js
 * @param {string} data
 * @return {Promise<any>} The response sent by content.js (may never resolve)
 */
const sendToContentJS = (message, data = '') =>
  new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(
        activeTab.id,
        {
          message,
          data,
        },
        resolve
      );
    });
  });

const takeScreenshot = () =>
  new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab((imgData) => resolve(imgData));
  });

/**
 * Occupies the thread for a given time
 * @param {number} milliseconds
 */
function sleep(milliseconds) {
  const start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}

chrome.browserAction.onClicked.addListener(main);
