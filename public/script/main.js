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
         urls: ['stun:tmqphiltraining.freeddns.org'],
      },
      {
         urls: ['turn:tmqphiltraining.freeddns.org'],
         username: '1675528966.055',
         credential: 'vwJNW8JIVIeoliaci4zyrghKpew=',
      },
      {
         url: 'stun:stun.services.mozilla.com',
      },
      {
         url: 'stun:stun.l.google.com:19302',
      },
   ],
   sdpSemantics: 'unified-plan',
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
         startConnection()
      })
      .catch((error) => console.error(error))
}

initCam()

const startConnection = () => {
   peerConnection = new RTCPeerConnection(configuration)

   peerConnection.onicecandidate = (event) => {
      if (event.candidate && idToSend !== null) {
         const candidate = {
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
         }
         socket.emit('send-candidate', idToSend, candidate)
      }
   }

   peerConnection.onaddstream = (event) => {
      remoteVideo.srcObject = event.stream
   }

   peerConnection.addStream(localStream)
}

const calleer = (id) => {
   idToSend = id
   let offerOptions = {
      offerToReceiveAudio: 1,
   }
   peerConnection
      .createOffer(offerOptions)
      .then((offer) => {
         peerConnection.setLocalDescription(offer)
         socket.emit('send-offer', socket.id, id, offer)
      })
      .catch((e) => console.log(e))
}

const callee = async (id, description) => {
   idToSend = id
   peerConnection.setRemoteDescription(new RTCSessionDescription(description))
   peerConnection
      .createAnswer()
      .then((answer) => {
         peerConnection.setLocalDescription(answer)
         socket.emit('send-answer', id, answer)
      })
      .catch((e) => console.log(e))
}

socket.on('offer', (id, description) => {
   showCallingDialog()
   callerID = id
   commingDescription = description
})

socket.on('answer', (answer) => {
   peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
   hideDialog()
   hideAction()
})

socket.on('candidate', (candidates) => {
   if (peerConnection) {
      const candidate = new RTCIceCandidate({
         sdpMLineIndex: candidates.label,
         candidate: candidates.candidate,
      })
      peerConnection.addIceCandidate(candidate)
   }
})

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
   hideDialog()
   showAction()
   showDialog('call ended')
})
