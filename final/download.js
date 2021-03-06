var fs = require('fs')
var WebTorrent = require('webtorrent')

var client2 = new WebTorrent()

client2.on('error', function (err) { console.error(err) })
client2.on('warning', function (err) { console.error(err) })

client2.on('torrent', function (torrent) {
   torrent.files[0].getBuffer(function (err, buf) {
   	if (err) console.error(err)          
	fs.writeFileSync(__dirname + '/downloaded.jpg', buf)
	gotBuffer = true
   	maybeDone()
   })

   torrent.once('done', function () {
	console.log('Downloaded file to', __dirname + '/downloaded.jpg')	
	gotDone = true
	maybeDone()
   })
})

const magnetURI = 'magnet:?xt=urn:btih:d1cbfbfa0bcd7a4f97e6f0a67335ca9c0923777e&dn=20228390_10155298196020325_5318241211675776399_n.jpg'
client2.add(magnetURI)

var gotBuffer = false
var gotDone = false
function maybeDone () {
    if (gotBuffer && gotDone) {
	client2.destroy()
    }
}
