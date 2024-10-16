#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function getVersion() {
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  const content = fs.readFileSync(packageJsonPath, { encoding: 'utf-8' });
  const packageInfo = JSON.parse(content);
  return packageInfo.version;
}

function setVersion(html) {
  const version = getVersion();
  if (!version) return html;
  const replaced = html.replace('__VERSION__', 'v' + version);
  return replaced;
}

function main() {
  const htmlPath = path.resolve(__dirname, '..', 'html');
  const publicPath = path.resolve(__dirname, '..', 'public');

  const srcIndexHtmlPath = path.join(htmlPath, 'index.html');
  const destIndexHtmlPath = path.join(publicPath, 'index.html');

  let html = fs.readFileSync(srcIndexHtmlPath, { encoding: 'utf-8' });
  html = setVersion(html);
  fs.writeFileSync(destIndexHtmlPath, html);
}

main();
