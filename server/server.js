const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const socketio = require('socket.io')
const ip = require('ip')

const log = console.log

const address = ip.address()

const httpPort = 3030

const connectUrl = `${address}:${httpPort}`

const app = express()
app.use(express.static(path.join(__dirname, '/assets/')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const httpServer = http.Server(app)

const io = socketio(httpServer)

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '/index.html'))
})

app.post('/', (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  response.send({message: 'Received!'})
  io.emit('emitMessage', request.body)
  log('\n' + JSON.stringify(request.body))
})

httpServer.listen(httpPort, () => {
    log(`> HTTP Server is running on: ${address}:${httpPort}`)
})
