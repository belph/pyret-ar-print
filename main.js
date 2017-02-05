#!/usr/bin/env node
var astUtils = require('./ast-utils.js');
var astring = require('astring');
var commandLineArgs = require('command-line-args');
var fs = require('fs');
var histogram = require('ascii-histogram');

const optionDefinitions = [
  { name: 'src', type: String, defaultOption: true },
  { name: 'help', alias: 'h', type: Boolean }
];

function loadFile(src, callback) {
  // loadFile logic taken from acorn
  if (src === "-") {
    var code = "";
    process.stdin.resume();
    process.stdin.on("data", chunk => code += chunk);
    process.stdin.on("end", () => callback(code));
  } else {
    callback(fs.readFileSync(src, "utf8"));
  }
}

function makeCallback() {
  var data = {};
  return {
    callback: (function(node) {
      var ar_vars = node.arguments[4].elements.length;
      if (data[ar_vars] === undefined) {
        data[ar_vars] = 1;
      } else {
        data[ar_vars]++;
      }
    }),
    data: data
  }
}

function printNode(node) {
  var args = node.arguments;
  console.log(astring(args[4], {indent: '  ', lineEnd: '\n'}));
  console.log(args[4].elements.length)
}

function usage() {
  const print = console.error;
  print("Usage: pyret-ar-print [options] file");
  print("Available options:");
  print("  -h,--help    Show this help message");
}

const args = commandLineArgs(optionDefinitions);
if (!args.src) {
  console.error("Missing required argument: src");
  usage();
  process.exit(1);
} else if (args.help) {
  usage();
  process.exit(1);
}

loadFile(args.src, code => {
  var cb = makeCallback();
  astUtils.getActivationRecords(code, cb.callback);
  console.log(histogram(cb.data));
});
