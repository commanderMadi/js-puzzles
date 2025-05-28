const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
})

const words = require('./words.js')

function shuffleWord(word) {
  const letters = word.split('')
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[letters[i], letters[j]] = [letters[j], letters[i]]
  }
  return letters.join('')
}

function selectWord(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length)
  const original = arr[randomIndex]
  const shuffled = shuffleWord(original)
  return { original, shuffled }
}

function checkAnswer(answer, selectedWord, attempts) {
  if (answer.toLowerCase() === selectedWord.original.toLowerCase()) {
    console.log('Congrats! You guessed it right!')
    readline.close()
  } else {
    attempts--
    if (attempts === 0) {
      console.log('You lost! Good luck next time! The original word was: ' + selectedWord.original)
      readline.close()
    } else {
      console.log(`not quite. try again. you now have: ${attempts} attempts`)
      promptUser(selectedWord, attempts)
    }
  }
}

function promptUser(selectedWord, attempts) {
  readline.question(`Guess the following word ${selectedWord.shuffled}: You have ${attempts} attempts\n`, (answer) => {
    checkAnswer(answer, selectedWord, attempts)
  })
}

function init() {
  const selectedWord = selectWord(words)
  let attempts = 3
  promptUser(selectedWord, attempts)
}

init()
