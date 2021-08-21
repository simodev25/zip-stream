'use strict';

const { PassThrough } = require('stream');
const { isArray } = Array;
module.exports = function(/*streams...*/) {
  // The output stream that will be returned to the caller
  const output = new PassThrough({ objectMode: true, end: false });

  let sources = argsOrArgArray(arguments);

  output.setMaxListeners(0);
  const { length } = sources;

  let buffers = Array.prototype.slice.call(sources).map(() => []);
  output.on('unpipe', remove);

  for (let sourceIndex = 0; sourceIndex < length; sourceIndex++) {
    sources[sourceIndex].on('data', chunk => {
      buffers[sourceIndex].push(chunk);

      if (buffers.every(buffer => buffer.length)) {
        push();
      }
    });
    sources[sourceIndex].once('end', remove.bind(null, sources[sourceIndex]));
    sources[sourceIndex].once('error', output.emit.bind(output, 'error'));
  }

  function isEmpty() {
    return sources.length == 0;
  }

  function push() {
    const result = buffers.map(buffer => buffer.shift());
    let entries = {};
    entries = result.map(r => Object.assign(entries, r));
    output.push(JSON.stringify(entries[0]));
  }

  function remove(source) {
    const items = buffers.find(buffer => buffer.length);
    if (items) {
      items.forEach(r => {
        output.push(JSON.stringify(r));
      });
      buffers = Array.prototype.slice.call(sources).map(() => []);
    }
    sources = Array.prototype.slice.call(sources).filter(function(it) {
      return it !== source;
    });
    if (!sources.length && output.readable) {
      output.end();
    }
  }

  return output;
};

function argsOrArgArray(args) {
  return args.length === 1 && isArray(args[0]) ? args[0] : args;
}
