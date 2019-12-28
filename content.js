/* eslint-disable no-undef */
/*
 * File:          content.js
 * Project:       PDFme
 * File Created:  Saturday, 14th December 2019 3:18:56 pm
 * Author(s):     Paul Martin, Alexandra Purcarea
 *
 * Last Modified: Friday, 27th December 2019 9:52:00 pm
 * Modified By:   Paul Martin (paul@blibspace.com)
 */

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.message) {
    case 'viewport_width':
      sendResponse(getViewportWidth());
      break;

    case 'viewport_height':
      sendResponse(getViewportHeight());
      break;

    case 'scroll_to_top':
      window.scrollTo(0, 0);
      sendResponse('scrolled');
      break;

    case 'scroll_down':
      if (atBottom()) {
        sendResponse('at_bottom');
        break;
      }

      if (request.data === 'viewport') {
        const vh = getViewportHeight();
        window.scrollBy(0, vh);
        sendResponse('scrolled');
      }
      break;
    default:
      console.error('unkown message');
      sendResponse('unknown message');
  }
});

function atBottom() {
  const vh = getViewportHeight();
  const pageHeight = getPageHeight();
  const atPageBottom = vh + window.scrollY >= pageHeight;
  return atPageBottom;
}

function getViewportHeight() {
  return window.innerHeight;
}

function getViewportWidth() {
  return window.innerWidth;
}

function getPageWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

function getPageHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}
