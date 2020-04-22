/*
 * File:          content.js
 * Project:       PDFme
 * File Created:  Saturday, 14th December 2019 3:18:56 pm
 * Author(s):     Paul Martin, Alexandra Purcarea
 *
 * Last Modified: Wednesday, 22nd April 2020 3:39:39 pm
 * Modified By:   Paul Martin
 */

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.message) {
    // Get values
    case 'viewport_width':
      sendResponse(getViewportWidth());
      break;

    case 'viewport_height':
      sendResponse(getViewportHeight());
      break;

    case 'page_height':
      sendResponse(getPageHeight());
      break;

    case 'device_pixel_ratio':
      sendResponse(window.devicePixelRatio);
      break;

    case 'initial_scroll_position':
      sendResponse([window.scrollX, window.scrollY]);
      break;

    // Actions
    case 'scroll_to_position': {
      const [x, y] = request.data;
      window.scrollTo(x, y);
      break;
    }

    case 'scroll_to_top':
      window.scrollTo(0, 0);
      sendResponse('scrolled');
      break;

    case 'scroll_down':
      if (isAtBottom()) {
        sendResponse('at_bottom');
        break;
      }

      // scroll by viewport height
      if (request.data === 'viewport') {
        const vh = getViewportHeight();
        window.scrollBy(0, vh);
        sendResponse('scrolled');
      } else {
        // scroll by specified amount
        window.scrollBy(0, request.data);
        sendResponse('scrolled');
      }
      break;

    // Changes to page
    case 'hide_scrollbar':
      {
        const styleElement = document.createElement('style');
        styleElement.id = 'hide_scrollbar';
        styleElement.innerHTML = 'body::-webkit-scrollbar {display: none;}';
        document.body.appendChild(styleElement);
      }
      break;

    case 'unhide_scrollbar':
      document.querySelector('style#hide_scrollbar').remove();
      break;

    default:
      sendResponse('unknown message');
  }
});

function isAtBottom() {
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
