#!/usr/bin/env node
/*  Fox–Chicken–Corn — CLI edition  */

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
})

process.on('SIGINT', () => {
  console.log('\nBye!')
  readline.close()
  process.exit(0)
})

/* ── Domain Objects ───────────────────────────────────────── */

class Farmer {
  constructor(location = 'south') {
    this.location = location
  }
  /** Toggle bank and return the previous bank. */
  move() {
    const oldLocation = this.location
    this.location = this.location === 'south' ? 'north' : 'south'
    console.log(`Farmer moved to ${this.location}!`)
    return oldLocation
  }
}

class Game {
  constructor(startBank = 'south') {
    this.banks = { south: ['fox', 'chicken', 'corn'], north: [] }

    this.startBank = startBank
    this.goalBank = startBank === 'south' ? 'north' : 'south'

    this.farmer = new Farmer(startBank)
    this.selectedItem = null // scalar, not array
    this.oldLocation = null

    this.gameOver = false
  }

  /* Convenience getter keeps us from caching state we already have */
  get availableItems() {
    return this.banks[this.farmer.location]
  }

  /* ── I/O helpers ─────────────────────────────────────── */

  ask(question, cb) {
    readline.question(question, (answer) => cb(answer.trim().toLowerCase()))
  }

  /* ── Game Flow ───────────────────────────────────────── */

  promptForSelection() {
    this.ask(
      `Select an item on the ${this.farmer.location} bank (${this.availableItems.join(
        ', '
      )})  – or type “back” to cancel\n> `,
      (selection) => this.handleSelection(selection)
    )
  }

  handleSelection(item) {
    if (!item) return this.promptForSelection() // empty input

    // allow the user to back out of the selection prompt
    if (['back', 'cancel', 'none'].includes(item)) {
      console.log('Selection cancelled.')
      return this.mainMenu()
    }

    if (!this.availableItems.includes(item)) {
      console.log('Invalid selection. Pick one of the listed items.')
      return this.promptForSelection()
    }

    this.selectedItem = item
    console.log(`You selected ${item}.`)
    this.mainMenu()
  }

  printBanksState() {
    console.log(
      `Current items on each bank: start bank (south): ${this.banks[this.startBank]} | goal bank (north): ${
        this.banks[this.goalBank]
      }`
    )
  }
  updateBanks() {
    // remove from old
    this.banks[this.oldLocation] = this.banks[this.oldLocation].filter((i) => i !== this.selectedItem)
    // add to new
    this.banks[this.farmer.location].push(this.selectedItem)
    this.printBanksState()
  }

  checkConditions() {
    if (!this.oldLocation) return // first turn: nothing to check

    const old = this.banks[this.oldLocation]
    const south = this.banks.south
    const north = this.banks.north

    if (old.includes('fox') && old.includes('chicken')) {
      return this.lose('🦊 ate the 🐔')
    }
    if (old.includes('chicken') && old.includes('corn')) {
      return this.lose('🐔 ate the 🌽')
    }
    if (this.banks[this.goalBank].length === 3) {
      console.log(`Hooray! You got everything safely to the ${this.goalBank} bank. 🧑‍🌾🦊🐔🌽`)
      return this.endGame()
    }
  }

  moveFarmer() {
    this.oldLocation = this.farmer.move()
    if (this.selectedItem) {
      this.updateBanks()
    } else {
      console.log("The farmer didn't carry any items. Items on each bank not updated")
      this.printBanksState()
    }
    this.selectedItem = null // clear carry
    this.checkConditions()
  }

  lose(msg) {
    console.log(`Better luck next time! ${msg}!`)
    this.endGame()
  }

  endGame() {
    this.gameOver = true
    readline.close()
  }

  /* ── Menus ───────────────────────────────────────────── */

  mainMenu() {
    if (this.gameOver) return

    this.ask('\nWhat now?  (move / select / q)\n> ', (choice) => {
      switch (choice) {
        case 'move':
          this.moveFarmer()
          break
        case 'select':
          this.promptForSelection()
          break
        case 'q':
          console.log('Thanks for playing!')
          this.endGame()
          return
        default:
          console.log('Only "move", "select", or "q" are allowed.')
      }
      // loop back unless game ended inside move / select
      if (!this.gameOver) this.mainMenu()
    })
  }

  /* ── Entry Point ─────────────────────────────────────── */

  start() {
    console.log('Welcome to the Fox–Chicken–Corn game!')
    this.mainMenu()
  }
}

/* ── Run ───────────────────────────────────────────────── */

new Game().start()
