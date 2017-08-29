var fs = require('fs')
var WebTorrent = require('webtorrent')

function seed(filename) {
    var client1 = new WebTorrent()

    client1.on('error', function (err) { console.error(err) })
    client1.on('warning', function (err) { console.error(err) })

    var torrent = client1.seed(fs.readFileSync(filename), { name: filename })
}

seed('20228390_10155298196020325_5318241211675776399_n.jpg')
