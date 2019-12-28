# PDFme

If you have ever tried printing a webpage or converting it to a multipage PDF, you've encountered this issue: More often than not the print dialogue completely massacres the entire website.

But how can it be that in a world of self-driving cars and quantum computers, you still can't properly print websites?

This is why, together with my good friend [Alexandra](https://github.com/alexandrapurcarea), I decided to tackle this very problem and develop a simple Chrome extension that enables the printing of webpages as is.

**PDFme is a Chrome extension to convert a website to PDF, splitting it into individual A4 pages.**

**_What you see is what you get!_**

## Installation

1. Clone the repo
2. Open Chrome
3. Go to `chrome://extensions`
4. Enable Developer mode in the top right corner
5. Load unpacked extension
6. Select the directory that was created when cloning this repo

## Usage

To convert the current tab to PDF, just click on the extension in your address bar and a new window containing screenshots of the webpage. You can now print this new window (and/or download as a PDF). Just close it once you're done.

## Todo

- Create a logo/icon
- Return to the user's scroll position before capturing
- Don't capture the scroll bar
- Automatically open the print dialogue in new window
  - Close window once printed
- Dynamically slice the screenshots to completely fill the A4 pages
- Only capture the middle portion of the screen. That way the navbar will be captured only once.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
