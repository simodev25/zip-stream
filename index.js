const {Readable} = require('stream');

const zipStreams = require('./zipStream')


const stream1 = new Readable({
    objectMode: true
})
const items1 = [{id: 1, name: 'name1'}, {id: 2, name: 'name2'}, {id: 3, name: 'name3'}, {id: 4, name: 'name4'}]
items1.forEach(item => stream1.push(item))
// no more data
stream1.push(null)

const items2 = [{id: 1, age: 23}, {id: 2, age: 24}, {id: 3, age: 24}, {id: 4, age: 25}]
const stream2 = new Readable({
    objectMode: true
})
items2.forEach(item => stream2.push(item))
// no more data
stream2.push(null)


const zipStream = zipStreams(stream1, stream2);
zipStream.pipe(process.stdout);
