const fs = require('fs')
const path = require('path')
const WebTorrent = require('webtorrent')

const filePath = path.join(__dirname, 'file.txt')

console.log(`Seeding ${filePath}`)
console.log('File contents are as follows:')
console.log()
console.log(fs.readFileSync(filePath, 'utf8'))
console.log()

const fileReadStream = fs.createReadStream(filePath)

const client = new WebTorrent()

const options = { // 33cda7a59b708d9e2bc6ad1b77e0b3a49949c468
  path: filePath,
  name: 'Torrent Name',
  comment: 'Torrent Comment',
  createdBy: 'Mr Mime'
}

console.log('Seeding file...')
client.seed(fileReadStream, options, () => {
  console.log('started seeding')
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