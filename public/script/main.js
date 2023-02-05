import {
   showCallingDialog,
   showCallDialog,
   hideDialog,
   hideAction,
   showAction,
   showDialog,
} from './dialogs.js'

const localVideo = document.getElementById('local')
const remoteVideo = document.getElementById('remote')

const socket = io('/')

socket.on('connect', () => {
   const myCode = document.getElementById('code')
   myCode.innerText = socket.id
   myCode.addEventListener('click', () => {
      navigator.clipboard.writeText(socket.id)
   })
})

const configuration = {
   iceServers: [
      {
         urls: 'stun:stun.l.google.com:13902',
      },
   ],
}

const defaultConstraints = {
   audio: true,
   video: true,
}

let peerConnection
let otherCandidate

let idToSend = null
let callerID
let commingDescription

let localStream

const initCam = () => {
   navigator.mediaDevices
      .getUserMedia(defaultConstraints)
      .then((stream) => {
         localStream = stream
         localVideo.srcObject = stream
      })
      .catch((error) => console.error(error))
}

initCam()

const startConnection = () => {
   peerConnection = new RTCPeerConnection(configuration)

   peerConnection.onicecandidate = (event) => {
      if (event.candidate && idToSend !== null) {
         socket.emit('send-candidate', idToSend, event.candidate)
      }
   }

   peerConnection.ontrack = (event) => {
      remoteVideo.srcObject = event.streams[0]
   }

   for (const track of localStream.getTracks()) {
      peerConnection.addTrack(track, localStream)
   }
}

const calleer = async (id) => {
   startConnection()
   idToSend = id
   const offer = await peerConnection.createOffer()
   await peerConnection.setLocalDescription(offer)
   socket.emit('send-offer', socket.id, id, offer)
}

const callee = async (id, description) => {
   startConnection()
   idToSend = id
   await peerConnection.setRemoteDescription(description)
   const answer = await peerConnection.createAnswer()
   await peerConnection.setLocalDescription(answer)
   socket.emit('send-answer', id, answer)
   await peerConnection.addIceCandidate(otherCandidate, success, fail)
}

socket.on('offer', (id, description) => {
   showCallingDialog()
   callerID = id
   commingDescription = description
})

socket.on('answer', async (description) => {
   await peerConnection.setRemoteDescription(description)
   await peerConnection.addIceCandidate(otherCandidate, success, fail)
   hideDialog()
   hideAction()
})

socket.on('candidate', (candidate) => {
   otherCandidate = candidate
})

const success = () => {
   console.log('candidate came and successfuly added as our ice candidate')
}

const fail = () => {
   console.log('candidate came but fail to add as our ice candidate')
}

const codeInput = document.getElementById('codeInput')
const callBtn = document.getElementById('codeBtn')
const ender = document.getElementById('ender')

callBtn.addEventListener('click', () => {
   if (codeInput.value !== '') {
      calleer(codeInput.value)
      showCallDialog()
   }
})

const accept = document.getElementById('accept')
accept.addEventListener('click', () => {
   callee(callerID, commingDescription)
   hideDialog()
   hideAction()
})

const decline = document.getElementById('decline')
decline.addEventListener('click', () => {
   hideDialog()
   socket.emit('call-decline', socket.id, callerID)
   showAction()
})

const decline2 = document.getElementById('decline2')
decline2.addEventListener('click', () => {
   hideDialog()
   socket.emit('call-aborted', socket.id, codeInput.value)
   showAction()
})

socket.on('aborted', () => {
   hideDialog()
   showAction()
})

ender.addEventListener('click', () => {
   socket.emit('call-ended', socket.id, callerID, idToSend)
})

socket.on('close', () => {
   peerConnection.close()
   callerID = null
   idToSend = null
   commingDescription = null
   hideDialog()
   showAction()
   showDialog('call ended')
})
