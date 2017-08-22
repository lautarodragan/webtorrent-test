//This test creates a client which loads a file, and a second client downloads it. 

var DHT = require('bittorrent-dht/server')
var fs = require('fs')
var MemoryChunkStore = require('memory-chunk-store')
var networkAddress = require('network-address')
var series = require('run-series')
var test = require('tape')
var WebTorrent = require('webtorrent')

test('Download using DHT (via magnet uri)', function (t) {
  t.plan(12)

  var dhtServer = new DHT({ bootstrap: false })

  dhtServer.on('error', function (err) { t.fail(err) })
  dhtServer.on('warning', function (err) { t.fail(err) })

  var client1, client2

  series([
    function (cb) {
      dhtServer.listen(cb)
    },

    function (cb) {
      client1 = new WebTorrent({
        tracker: false,
        dht: { bootstrap: '127.0.0.1:' + dhtServer.address().port, host: networkAddress.ipv4() }
      })

      client1.dht.on('listening', function () {
        t.equal(client1.dhtPort, client1.dht.address().port)
      })

      client1.on('error', function (err) { t.fail(err) })
      client1.on('warning', function (err) { t.fail(err) })

      var torrent = client1.add(fs.readFileSync('20228390_10155298196020325_5318241211675776399_n (1).torrent'), {store: MemoryChunkStore})

      torrent.on('dhtAnnounce', function () {

	console.log(torrent.magnetURI)
        t.pass('finished dht announce')
        announced = true
        maybeDone()
      })

      torrent.on('ready', function () {
        //torrent metadata has been fetched -- sanity check it
        t.equal(torrent.name, '20228390_10155298196020325_5318241211675776399_n.jpg')

        var names = [ '20228390_10155298196020325_5318241211675776399_n.jpg' ]
        t.deepEqual(torrent.files.map(function (file) { return file.name }), names)
      })

      torrent.load(fs.createReadStream('20228390_10155298196020325_5318241211675776399_n.jpg'), function (err) {
        t.error(err)
        loaded = true
        maybeDone()
      })

      var announced = false
      var loaded = false
      function maybeDone () {
        if (announced && loaded) cb(null)
      }
    },

    function (cb) {
      client2 = new WebTorrent({
        tracker: false,
        dht: { bootstrap: '127.0.0.1:' + dhtServer.address().port, host: networkAddress.ipv4() }
      })

      client2.on('error', function (err) { t.fail(err) })
      client2.on('warning', function (err) { t.fail(err) })

      client2.on('torrent', function (torrent) {
        torrent.files[0].getBuffer(function (err, buf) {
          t.error(err)
	  const file_content = fs.readFileSync('/home/patricio/poet/webtorrent-test/20228390_10155298196020325_5318241211675776399_n.jpg')
          t.deepEqual(buf, file_content, 'downloaded correct content')

	  fs.writeFileSync('/home/patricio/hola.jpg', buf)

          gotBuffer = true
          maybeDone()
        })

        torrent.once('done', function () {
          t.pass('client2 downloaded torrent from client1')

          gotDone = true
          maybeDone()
        })
      })

      const magnetURI = 'magnet:?xt=urn:btih:d1cbfbfa0bcd7a4f97e6f0a67335ca9c0923777e&dn=20228390_10155298196020325_5318241211675776399_n.jpg&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'
      client2.add(magnetURI, {store: MemoryChunkStore})

      var gotBuffer = false
      var gotDone = false
      function maybeDone () {
        if (gotBuffer && gotDone) cb(null)
      }
    }
  ], function (err) {
    t.error(err)

    client1.destroy(function (err) {
      t.error(err, 'client1 destroyed')
    })
    client2.destroy(function (err) {
      t.error(err, 'client2 destroyed')
    })
    dhtServer.destroy(function (err) {
      t.error(err, 'dht server destroyed')
    })
  })
})
