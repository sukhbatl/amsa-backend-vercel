const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports.extractContent = (s) => {
    const document = JSDOM.fragment(s);
    return document.textContent || document.innerText;
};
