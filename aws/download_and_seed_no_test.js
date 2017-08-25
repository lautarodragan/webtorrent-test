var DHT = require('bittorrent-dht/server')
var fs = require('fs')
var MemoryChunkStore = require('memory-chunk-store')
var networkAddress = require('network-address')
var WebTorrent = require('webtorrent')

var dhtServer = new DHT({ bootstrap: false })

const filename = '20228390_10155298196020325_5318241211675776399_n.jpg'

dhtServer.on('error', function (err) { console.error(err) })
dhtServer.on('warning', function (err) { console.error(err) })

var client1, client2
dhtServer.listen(cb)

function cb() {

	client1 = new WebTorrent({
		tracker: false,
		dht: { bootstrap: '127.0.0.1:' + dhtServer.address().port, host: networkAddress.ipv4() }
	})

	client1.on('error', function (err) { console.error(err) })
	client1.on('warning', function (err) { console.error(err) })

	var torrent = client1.seed(fs.readFileSync(filename), {
		name: filename
	})

	torrent.on('dhtAnnounce', function () {
		console.log('finished dht announce')
		announced = true
		maybeDone()
	})

	torrent.on('ready', function () {
		console.log('torrent metadata has been fetched -- sanity check it')
	})

	var announced = false
	function maybeDone () {
		download(torrent.magnetURI)
	}
}

function download(magnetURI) {
	console.log('Cliente 2')
	client2 = new WebTorrent({
		tracker: false,
		dht: { bootstrap: '127.0.0.1:' + dhtServer.address().port, host: networkAddress.ipv4() } 
	})

	client2.on('error', function (err) { console.error(err) })
	client2.on('warning', function (err) { console.error(err) })

	client2.on('torrent', function (torrent) {
	   torrent.files[0].getBuffer(function (err, buf) {

		console.log('getBuffer')

	   	if (err) console.error(err)          

		fs.writeFileSync('/home/patricio/poet/webtorrent-test/aws/export.jpg', buf)

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
}

