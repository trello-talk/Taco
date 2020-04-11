const fs = require('fs');
const path = require('path');
const reload = require('require-reload')(require);

const Extractor = module.exports = {
  extractors: [],
};

Extractor.loadExtractors = (extPath = path.join(__dirname, 'extractors')) => {
  fs.readdirSync(extPath).map(file => {
    if(!file.endsWith('.js')) return;
    const extractor = reload(path.join(extPath, file));
    if(extractor.regex && extractor.extract)
      Extractor.extractors.push(extractor);
  });
};

Extractor.parseURL = async url => {
  if(!Extractor.extractors.length)
    Extractor.loadExtractors();
  for (let i = 0, len = Extractor.extractors.length; i < len; i++) {
    const extractor = Extractor.extractors[i];
    const match = url.match(extractor.regex);
    if(match) {
      const result = await extractor.extract(match, url);
      if(result) return result;
    }
  }
  return null;
};