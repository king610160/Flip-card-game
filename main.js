const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  getCardsElement(index) {
    return `<div data-index="${index}" class = "cards back">
      </div>`
  },
  
  getCardsContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)] 
    return `
        <p>${number}</p>
        <img src=${symbol} alt="">
        <p>${number}</p>`
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  
  displayCards(indexes) {//放indexes，讓程式碼用輸入值去呼叫
    const rootElement = document.querySelector("#cards")
    rootElement.innerHTML = indexes.map(index => this.getCardsElement(index)).join('')
  },

  //flipCard(card)
  //flipCards(1,2,3,4,5)
  //cards = [1,2,3,4,5]

  flipCards(...cards) {//...可以變成陣列
    cards.map(card => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardsContent(Number(card.dataset.index)) // 暫時給定 10 Number(card.dataset.index
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    }) 
  },

  renderScore(score){
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times){
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards){
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {
        card.classList.remove('wrong')
      }, {
        once: true //加eventListener會增加效能，加once true，意思是只會觸發一次
      })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },

}

const model = {
  revealedCards:[],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0,
}

const controller = {
  currentState:GAME_STATE.FirstCardAwaits,//狀態變翻第一張牌之前
  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if(!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits :
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break //break會繼續執行程式碼，return是到那裡結束

      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        view.renderTriedTimes((++model.triedTimes))

        if (model.isRevealedCardsMatched()){
          //配對正確
          view.renderScore((model.score += 10))
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          view.appendWrongAnimation(...model.revealedCards)
          this.currentState = GAME_STATE.CardsMatchFailed
          setTimeout(this.resetCards,1000)//指過了1秒
          //不能寫this.resetCard(),1000，這樣會失敗
        }
        break //break會繼續執行程式碼，return是到那裡結束
    }
    console.log(this.currentState)
    console.log(model.revealedCards)
  },

  resetCards(){
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

// node list (array-like)
document.querySelectorAll('.cards').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})

// const arr2 = Array(10) //這樣宣告陣列會產生空陣列，但裡面有10個空格
// XXX.map()指的是把XXX裡的東西一個個拿出來
// XXX.join()是指把XXX裡的東西，假如是陣列，就把內容直接全部轉成文字