const socket = io('/')

const configuration = {
   iceServers: [
      {
         urls: 'stun:stun.l.google.com:13902',
      },
   ],
}

const stratConnection = () => {
   peerConnection = new RTCPeerConnection(configuration)

   peerConnection.onicecandidate = (event) => {
      if (event.candidate && idToSend !== null) {
         socket.emit('send-candidate', idToSend, event.candidate)
      }
   }

   // peerConnection.addEventListener(
   //    'track',
   //    (e) => {
   //       remoteVideo.srcObject = e.streams[0]
   //    },
   //    false
   // )

   peerConnection.ontrack = (event) => {
      remoteVideo.srcObject = event.streams[0]
   }

   const localStreams = localStream
   for (const track of localStreams.getTracks()) {
      console.log(track)
      peerConnection.addTrack(track, localStreams)
   }

   console.log(peerConnection)
}

const calleer = async (id) => {
   stratConnection()
   idToSend = id
   const offer = await peerConnection.createOffer()
   await peerConnection.setLocalDescription(offer)
   socket.emit('send-offer', socket.id, id, offer)
}

const callee = async (id, description) => {
   stratConnection()
   idToSend = id
   await peerConnection.setRemoteDescription(description)
   const answer = await peerConnection.createAnswer()
   await peerConnection.setLocalDescription(answer)
   socket.emit('send-answer', id, peerConnection.localDescription)
   await peerConnection.addIceCandidate(otherCandidate, success, fail)
}
