const dialog = document.getElementById('dialog')
const dialog2 = document.getElementById('dialog2')
const dialog3 = document.getElementById('dialog3')
const dialogMessage = document.getElementById('dialogMessage')
const codeInput = document.getElementById('codeInput')
const callBtn = document.getElementById('codeBtn')
const ender = document.getElementById('ender')

export const showCallingDialog = () => {
   dialog.style.transform = 'translateY(-280px)'
}

export const showCallDialog = () => {
   dialog2.style.transform = 'translateY(-420px)'
}

export const hideDialog = () => {
   dialog.style.transform = 'translateY(0)'
   dialog2.style.transform = 'translateY(0)'
}

export const hideAction = () => {
   callBtn.style.display = 'none'
   codeInput.style.display = 'none'
   ender.style.display = 'block'
   ender.style.background = 'red'
}

export const showAction = () => {
   callBtn.style.display = 'block'
   codeInput.style.display = 'block'
   ender.style.display = 'none'
}

export const showDialog = (message) => {
   dialog3.style.transform = 'translateY(-535px)'
   dialogMessage.innerText = message
   window.setTimeout(() => {
      dialog3.style.transform = 'translateY(0)'
      console.log('hasdas')
   }, 3000)
}
