/*
 * File:          background.js
 * Project:       PDFme
 * File Created:  Saturday, 14th December 2019 3:18:59 pm
 * Author(s):     Paul Martin, Alexandra Purcarea
 *
 * Last Modified: Sunday, 15th December 2019 3:47:43 pm
 * Modified By:   Paul Martin (paul@blibspace.com)
 */

// Called when the user clicks on the browser action.
main = tab => {
  // take screenshot
  chrome.tabs.captureVisibleTab(imgData => {
    // generate an Image object from imgData
    const img = new Image();
    img.src = imgData;

    // display the image in a new tab
    const w = window.open('', 'imgWindow', 'width=800,height=600');
    w.document.write(img.outerHTML);
  });

  // Send a message to the active tab
  function sendToContentJS(message, data = '', responseCallback = () => {}) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(
        activeTab.id,
        {
          message: message,
          data: data
        },
        responseCallback
      );
    });
  }

  // sendToContentJS('clicked_browser_action');
};

chrome.browserAction.onClicked.addListener(main);
