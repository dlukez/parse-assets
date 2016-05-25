#!/usr/bin/env node
/**
 * parse-assets CLI tool
 *
 * The MIT License (MIT)
 *
 *  Copyright (c) 2016 Daniel Zimmermann
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of
 *  this software and associated documentation files (the "Software"), to deal in
 *  the Software without restriction, including without limitation the rights to
 *  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 *  the Software, and to permit persons to whom the Software is furnished to do so,
 *  subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 *  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 *  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 *  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 *  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

'use strict';

var fs = require('fs');
var hyd = require('hydrolysis');
var dom5 = require('dom5');
var url = require('url');
var path = require('path');

var basePath = process.argv[2];
var inputPath = process.argv[3];

var EXTERNAL = /^(?:https?:)?\/\//;

if (process.argv.length === 3) {
  basePath = './';
  inputPath = process.argv[2];
} else if (process.argv.length === 4) {
  basePath = process.argv[2];
  inputPath = process.argv[3];
} else {
  console.error('Invalid number of arguments');
  process.exit(1);
}

basePath = path.resolve(basePath);
inputPath = path.resolve(path.resolve(basePath, inputPath));

if (fs.statSync(inputPath).isDirectory()) {
  inputPath = path.join(inputPath, 'index.html');
}

var loader = new hyd.Loader();
loader.addResolver(new hyd.NoopResolver(EXTERNAL));
loader.addResolver(new hyd.FSResolver({
  root: basePath,
  basePath: '/'
}));

var analyzer = new hyd.Analyzer(false, loader);
inputPath = path.join('/', path.relative(basePath, inputPath));
analyzer.metadataTree(inputPath).then(function (tree) {
  var list = treeToUrls(tree).slice(1).reverse();
  console.log(list);
}).catch(function (error) {
  console.log(error);
});

function treeToUrls(tree, array) {
  if (!array) {
    array = [];
  }

  if (!tree || !tree.href) {
    return array;
  }

  // add this html file
  array.push(tree.href);

  // process sub-trees
  tree.imports.forEach(function (im) {
    treeToUrls(im, array);
  });

  // process scripts and styles
  process(tree.html.script, 'src');
  process(tree.html.style, 'href');
  function process(elements, attribute) {
    elements.forEach(function (element) {
      var src = dom5.getAttribute(element, attribute);
      
      if (!src || EXTERNAL.test(src)) {
        return;
      }

      array.push(url.resolve(tree.href, src));
    });
  }

  return array;
}