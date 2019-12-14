/*
 * File:          content.js
 * Project:       PDFme
 * File Created:  Saturday, 14th December 2019 3:18:56 pm
 * Author(s):     Paul Martin, Alexandra Purcarea
 *
 * Last Modified: Saturday, 14th December 2019 8:31:19 pm
 * Modified By:   Paul Martin (paul@blibspace.com)
 */

console.log('helllloooooo');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(`message: ${request.message}`);
  switch (request.message) {
    case 'clicked_browser_action':
      console.log('creating pdf');
      html2canv2pdf();
      break;

    case 'screenshot':
      // get image data
      const imgUrl = request.data;
      const img = new Image();
      img.src = imgUrl;

      const w = window.open('');
      w.document.write(img.outerHTML);

      break;
  }
  /*
  if (request.message === 'clicked_browser_action') {
    console.log('creating pdf');
    html2canv2pdf();
    //html2pdf();

    console.log('finished');
  }
  */
});

const html2canv2pdf = () => {
  const options = {
    allowTaint: false,
    proxy: true,
    useCORS: true,
    foreignObjectRendering: true
  };
  html2canvas(document.body, options).then(function(canvas) {
    document.body.appendChild(canvas);
    const pdf = canv2pdf(canvas);

    // show
    var blob = pdf.output('blob');
    window.open(URL.createObjectURL(blob), 'myWindow', 'width=800,height=600');
  });
};

const canv2pdf = canvas => {
  const imgData = canvas.toDataURL('image/png');
  //console.log(imgData);
  const doc = new jsPDF('p', 'mm');
  doc.addImage(imgData, 'PNG', 10, 10);
  return doc;
};

function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

function getHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}
