/* eslint-disable no-undef */
/*
 * File:          background.js
 * Project:       PDFme
 * File Created:  Saturday, 14th December 2019 3:18:59 pm
 * Author(s):     Paul Martin, Alexandra Purcarea
 *
 * Last Modified: Saturday, 28th December 2019 1:15:13 pm
 * Modified By:   Paul Martin (paul@blibspace.com)
 */

/**
 * Called when the user clicks on the browser action (extension button in the menu bar).
 * @param {chrome-tab} tab
 */
async function main(tab) {
  // the array containing the individual screenshots
  const screenshots = [];

  const screenshotLoop = response =>
    new Promise((resolve, reject) => {
      switch (response) {
        case 'scrolled':
          sleep(30);
          takeScreenshot()
            .then(imgData => {
              // add screenshot to list
              screenshots.push(imgData);
            })
            .then(() => {
              // scroll down again
              sendToContentJS('scroll_down', 'viewport')
                .then(screenshotLoop) // recursively
                .then(resolve); // iterate base case back to beginning
            });
          break;
        case 'at_bottom': // base case
          resolve(screenshots);
          break;
        default:
          break;
      }
    });

  sendToContentJS('scroll_to_top')
    .then(screenshotLoop)
    .then(concatImgs) // convert image data to html
    .then(imgsHtml => {
      // display the html in a new window
      const w = window.open('', 'imgWindow', 'width=800,height=600');
      w.document.write(imgsHtml);
    });
}

/**
 * A function to send data to and receive from content.js
 * @param {string} message The name under which the data is passed to content.js
 * @param {string} data
 * @return {Promise<any>} The response sent by content.js (may never resolve)
 */
const sendToContentJS = (message, data = '') =>
  new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(
        activeTab.id,
        {
          message,
          data
        },
        resolve
      );
    });
  });

const takeScreenshot = () =>
  new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(imgData => resolve(imgData));
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
