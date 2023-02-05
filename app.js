//create a simple video chat application using webRTC

const express = require('express')
const http = require('http')
const PORT = 9000
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)

app.use(express.static('public'))

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
   socket.on('send-offer', (ownId, id, localDescription) => {
      io.to(id).emit('offer', ownId, localDescription)
   })

   socket.on('send-answer', (id, localDescription) => {
      io.to(id).emit('answer', localDescription)
   })

   socket.on('send-candidate', (id, candidate) => {
      io.to(id).emit('candidate', candidate)
   })

   socket.on('call-decline', (calleer, callee) => {
      io.to(calleer).emit('close')
      io.to(callee).emit('close')
   })

   socket.on('call-aborted', (calleer, callee) => {
      io.to(calleer).emit('close')
      io.to(callee).emit('aborted')
   })

   socket.on('call-ended', (calleer, callee, callee2) => {
      io.to(calleer).emit('close')
      io.to(callee).emit('close')
      io.to(callee2).emit('close')
   })
})

server.listen(PORT, () => {
   console.log(`listening on ${PORT}`)
})
