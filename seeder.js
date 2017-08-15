const useHybrid = process.argv[3] || false

console.log(`Using WebTorrent ${useHybrid ? 'Hybrid' : 'Non-Hybrid'}`)

const fs = require('fs')
const path = require('path')
const WebTorrent = require(useHybrid ? 'webtorrent-hybrid' : 'webtorrent')

const fileName = process.argv[2]
const filePath = path.join(__dirname, fileName)

if (!fs.existsSync(filePath)) {
  console.log(`File ${filePath} not found.`)
  process.exit()
}

console.log(`Seeding ${filePath}`)

const fileReadStream = fs.createReadStream(filePath)

const client = new WebTorrent()

const options = {
  path: filePath,
  name: `Sharing ${fileName}`,
  comment: 'Torrent Comment',
  createdBy: 'Mr Mime'
}

client.seed(fileReadStream, options, () => {
  console.log('Started seeding')
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