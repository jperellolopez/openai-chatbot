import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.getElementById('chat_container')

let loadInterval

//function to load messages. Loads dots while answer is being generated.
function loader(element) {
  // content initially empty
  element.textContent = ''
  // concatenates a dot until it reaches 4, then gets empty again. This repets every 300ms
  loadInterval = setInterval(() => {
    element.textContent += '.'
    if (element.textContent === '....') {
      element.textContent = ''
    }
  }, 300)
}

// function to make appear the answer text gradually
function typeText(element, text) {
  let index = 0
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

// function to generate a unique id
function generateUniqueId() {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexString = randomNumber.toString(16)

  return `id-${timestamp}-${hexString}`
}

// function to generate the block of code corresponding to the messages
function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault()
  const data = new FormData(form)

  //user chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  form.reset()

  // bot chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  chatContainer.scrollTop = chatContainer.scrollHeight
  const messageDiv = document.getElementById(uniqueId)

  // display loading indicator
  loader(messageDiv)

  // fetch data from server to get the bot response
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML=""

  // get the actual response, parses it and passes it to the typeText function
  if(response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim()
    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text()
    messageDiv.innerHTML = "Ha ocurrido un error, no se puede procesar el texto introducido"
    alert(err)
  }

}

// add the submit function as an event to the submit button or the enter key
form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})