var DHT = require('bittorrent-dht/server')
var fs = require('fs')
var MemoryChunkStore = require('memory-chunk-store')
var networkAddress = require('network-address')
var WebTorrent = require('webtorrent')

const filename = '20228390_10155298196020325_5318241211675776399_n.jpg'

function seed() {

	var client1 = new WebTorrent({
		tracker: false,
	})

	client1.on('error', function (err) { console.error(err) })
	client1.on('warning', function (err) { console.error(err) })
	client1.dht.on('node', function (node) { console.error('client1.dht node', node) })

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
		console.log(torrent.magnetURI)
	})

	var announced = false
	function maybeDone () {
		//do nothing, wait for torrent to be downloaded
	}
}

seed()