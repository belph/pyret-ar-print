var astUtils = require('./ast-utils.js');
var astring = require('astring');
var commandLineArgs = require('command-line-args');
var fs = require('fs');
var histogram = require('ascii-histogram');

const optionDefinitions = [
  { name: 'src', type: String, defaultOption: true },
  { name: 'diff', type: String, multiple: true },
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'list', alias: 'l', type: Boolean }
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

function makeDiffCallback() {
  var data = {'sum': 0, 'count': 0};
  return {
    callback: (function(node) {
      data.sum += node.arguments[4].elements.length;
      data.count++;
    }),
    data: data
  }
}

function makeHistogramCallback() {
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

function processFiles(files, callback) {
  files.forEach(file => {
    processFile(file, callback);
  });
}

function processFileList(fileList, callback) {
  loadFile(fileList, filesStr => {
    var files = filesStr.trim().split("\n");
    if (files.length === 0) {
      console.warn("File list is empty: " + fileList);
      return null;
    }
    return processFiles(files, callback);
  });
}

function processFile(file, callback) {
  // callback should have the following fields:
  //   callback.callback :: (AST Node -> Any)
  //   callback.data :: Any
  // The callback will be called on every Activation Record
  // in `file`, and `callback.data` will be returned.
  console.log("Processing file: " + file);
  loadFile(file, code => {
    astUtils.getActivationRecords(code, callback.callback);
    return callback.data;
  });
}

function printHistogram(file) {
  var cb = makeHistogramCallback();
  processFile(file, cb);
  console.log(histogram(cb.data));
}

function printNode(node) {
  var args = node.arguments;
  console.log(astring(args[4], {indent: '  ', lineEnd: '\n'}));
  console.log(args[4].elements.length);
}

function usage() {
  const print = console.error;
  print("Usage: pyret-ar-print [options] (file | --diff file1 file2)");
  print("By default, prints a histogram of the given file.");
  print("Available options:");
  print("     --diff    Compare counts of file1 and file2");
  print("               [Note: it typically only makes sense");
  print("                      to pass compiled Phase A and");
  print("                      Phase B files if running on the");
  print("                      Pyret compiler itself.]");
  print("  -h,--help    Show this help message");
  print("  -l,--list   Treat the input files as lists of files");
}

if (require.main === module) {
  // called as script
  const args = commandLineArgs(optionDefinitions);
  if (args.src && args.diff) {
    console.error("Extra source file given.");
    usage();
    process.exit(1);
  } else if (args.diff && args.diff.length != 2) {
    console.error("Option --diff requires exactly two files.")
    usage();
    process.exit(1);
  } if (!args.diff && !args.src) {
    console.error("Missing required argument: src");
    usage();
    process.exit(1);
  } else if (args.help) {
    usage();
    process.exit(1);
  }

  var processor = args.list ? processFileList : processFile;

  if (args.diff) {
    var cb0 = makeDiffCallback();
    var cb1 = makeDiffCallback();
    processor(args.diff[0], cb0);
    processor(args.diff[1], cb1);
    var avg0 = cb0.data.sum / cb0.data.count;
    var avg1 = cb1.data.sum / cb1.data.count;
    var pctDiff = Math.abs((avg1 - avg0) / avg0 * 100);
    var verb;
    if (avg1 < avg0) {
      console.log(`Average AR size shrank from ${avg0} to ${avg1} (${pctDiff}% reduction).`);
    } else if (avg1 == avg0) {
      console.log(`Average AR size STAYED THE SAME at ${avg0}.`);
    } else {
      console.log(`Average AR size GREW from ${avg0} to ${avg1} (${pctDiff}% increase).`);
    }
  } else {
    var cb = makeHistogramCallback();
    processor(args.src, cb);
    console.log(histogram(cb.data));
  }
}

module.exports = {
  'getActivationRecords': astUtils.getActivationRecords,
  'processFile': processFile,
  'printHistogram': printHistogram
}
