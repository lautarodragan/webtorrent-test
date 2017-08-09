const fs = require('fs')
const path = require('path')
const WebTorrent = require('webtorrent')

const torrentInfoHash = '18f2012c0b0af8972a86ad52b8f288a2b4a0b9b9'

const downloadsPath = path.join(__dirname, 'downloads')

console.log(`Downloading ${torrentInfoHash} to ${downloadsPath}`)
console.log()

const client = new WebTorrent()

const options = {
  path: downloadsPath,
}

client.add(torrentInfoHash, options, torrent => {
  console.log('torrent cb', torrent)
  torrent.on('error', error => {
    console.log(error)
  })
  torrent.on('download', () => {
    console.log(torrent.progress)
  })
  torrent.on('done', () => {
    console.log('downloaded')
  })
})

setInterval(() => {
  for (let torrent of client.torrents) {
    console.log('Torrent Progress')
    console.log(torrentProgress(torrent))
    console.log()
    console.log()
  }
}, 1000)

function torrentProgress(torrent) {
  return {
    infoHash: torrent.infoHash,
    path: torrent.path,
    magnetURI: torrent.magnetURI,
    announce: torrent.announce,
    progress: torrent.progress,
    numPeers: torrent.numPeers,
    downloaded: torrent.downloaded,
    uploaded: torrent.uploaded,
    received: torrent.received,
  }
}