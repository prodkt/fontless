const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'dist', 'ffi.js');
const destFile = path.join(__dirname, 'public', 'ffi.js');

fs.copyFile(sourceFile, destFile, (err) => {
  if (err) throw err;
  console.log('ffi.js was copied to public/');
});