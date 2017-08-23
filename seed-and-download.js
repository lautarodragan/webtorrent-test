//This test creates a client which seeds a file, and a second client downloads it. 

var DHT = require('bittorrent-dht/server')
var fs = require('fs')
var MemoryChunkStore = require('memory-chunk-store')
var networkAddress = require('network-address')
var series = require('run-series')
var test = require('tape')
var WebTorrent = require('webtorrent')

test('Download using DHT (via magnet uri)', function (t) {
  t.plan(11)

  var dhtServer = new DHT({ bootstrap: false })

  const filename = '20228390_10155298196020325_5318241211675776399_n.jpg'
  const magnetURI = 'magnet:?xt=urn:btih:d1cbfbfa0bcd7a4f97e6f0a67335ca9c0923777e&dn=20228390_10155298196020325_5318241211675776399_n.jpg'

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

      var torrent = client1.seed(fs.readFileSync(filename), {
        name: filename
      })

      torrent.on('dhtAnnounce', function () {
        t.pass('finished dht announce')
        announced = true
        maybeDone()
      })

      torrent.on('ready', function () {
        //torrent metadata has been fetched -- sanity check it
        t.equal(torrent.name, filename)
        t.deepEqual(torrent.files.map(function (file) { return file.name }), [ filename ])
      })

      var announced = false
      function maybeDone () {
        if (announced) cb(null)
      }
    },

    function (cb) {

      console.log('Cliente 2')
      client2 = new WebTorrent({
        tracker: false,
        dht: { bootstrap: '127.0.0.1:' + dhtServer.address().port, host: networkAddress.ipv4() }
      })

      client2.on('error', function (err) { t.fail(err) })
      client2.on('warning', function (err) { t.fail(err) })

      client2.on('torrent', function (torrent) {
        torrent.files[0].getBuffer(function (err, buf) {
          t.error(err)
	  const file_content = fs.readFileSync('/home/patricio/poet/webtorrent-test/' + filename)
          t.deepEqual(buf, file_content, 'downloaded correct content')

	  fs.writeFileSync('/home/patricio/export.jpg', buf)

          gotBuffer = true
          maybeDone()
        })

        torrent.once('done', function () {
          t.pass('client2 downloaded torrent from client1')

          gotDone = true
          maybeDone()
        })
      })

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
