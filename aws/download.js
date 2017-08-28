var DHT = require('bittorrent-dht/server')
var fs = require('fs')
var MemoryChunkStore = require('memory-chunk-store')
var networkAddress = require('network-address')
var WebTorrent = require('webtorrent')

const magnetURI = 'magnet:?xt=urn:btih:d1cbfbfa0bcd7a4f97e6f0a67335ca9c0923777e&dn=20228390_10155298196020325_5318241211675776399_n.jpg&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'

var client2 = new WebTorrent({
	tracker: false
})

// setInterval(() => { console.log('dht', client2.dhtPort, client2.dht.toJSON()) }, 1000)

// client2.dht.on('error', function (err) { console.error('dht', err) })
// client2.dht.on('warning', function (err) { console.error('dht', err) })
// client2.dht.on('listening', function (err) { console.error('dht listening', client2.dht.address()) })
// client2.dht.on('query', function (err) { console.error('dht query', err) })

client2.dht.on('node', function (node) {
  if (node.host === '54.211.60.172')
    console.error('FOUND OUR DHT NODE', node)
  // console.error('dht node', node)
})

client2.on('error', function (err) { console.error(err) })
client2.on('warning', function (err) { console.error(err) })

client2.on('torrent', function (torrent) {
   torrent.files[0].getBuffer(function (err, buf) {

	console.log('getBuffer')

   	if (err) console.error(err)          

	console.log('Downloaded file to', __dirname + '/downloaded.jpg')
	fs.writeFileSync(__dirname + '/downloaded.jpg', buf)

	gotBuffer = true
   	maybeDone()
   })

   torrent.once('done', function () {
	console.log('client2 downloaded torrent from client1')
	gotDone = true
	maybeDone()
   })

})

client2.add(magnetURI, {store: MemoryChunkStore})

var gotBuffer = false
var gotDone = false
function maybeDone () {
   if (gotBuffer && gotDone) console.log('Done')
}
