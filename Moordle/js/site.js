const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.key-container')
const messageDisplay = document.querySelector('.message-container')

let wordle
let currenturl = window.location.origin + '/Home/'
let definition

const getWordle = () => {
    fetch(currenturl+'Word')
        .then(response => response.json())
        .then(json => {
            wordle = json['RandomWord'].toUpperCase()
        })
        .catch(err => console.log(err))
}
getWordle()


const keys = [
    'A','Z','E','R','T','Y','U','I','O','P',
    'Q','S','D','F','G','H','J','K','L','M',
    'W', 'X', 'C', 'V', 'B', 'N', '«', 'ENTER'
]
const guessRows = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
]
let currentRow = 0
let currentTile = 0
let isGameOver = false

guessRows.forEach((guessRow, guessRowIndex) => {
    const rowElement = document.createElement('div')
    rowElement.setAttribute('id', 'guessRow-' + guessRowIndex)
    guessRow.forEach((_guess, guessIndex) => {
        const tileElement = document.createElement('div')
        tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
        tileElement.classList.add('tile')
        rowElement.append(tileElement)
    })
    tileDisplay.append(rowElement)
})
let count = 0
keys.forEach(key => {
    const buttonElement = document.createElement('button')
    buttonElement.textContent = key
    buttonElement.setAttribute('id', key)
    buttonElement.addEventListener('click', () => handleClick(key))
    if (count <= 9) {
        const line1 = document.querySelector('.line-1')
        line1.append(buttonElement);
    }
    else if (count > 9 && count <= 19) {
        const line2 = document.querySelector('.line-2')
        line2.append(buttonElement);
    }
    else
    {
        const line3 = document.querySelector('.line-3')
        line3.append(buttonElement);
    }
    count++
    })




document.addEventListener('keydown',
    function (event) {
        if (event.keyCode == '8' || event.keyCode == '13') {
            handleClick(event.keyCode);
        }
        else
        {
            handleClick(String.fromCharCode(event.keyCode))
        }
}, true);

const handleClick = (letter) => {
    if (!isGameOver) {
        if (letter == '8' || letter == '«') {
            deleteLetter()
            return
        }
        if (letter == '13' || letter == 'ENTER') {
            checkRow()
            return
        }
        addLetter(letter)
    }
}

const addLetter = (letter) => {
    if (currentTile < 5 && currentRow < 6) {
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
        tile.textContent = letter
        guessRows[currentRow][currentTile] = letter
        tile.setAttribute('data', letter)
        currentTile++
    }
}

const deleteLetter = () => {
    if (currentTile > 0) {
        currentTile--
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
        tile.textContent = ''
        guessRows[currentRow][currentTile] = ''
        tile.setAttribute('data', '')
    }
}

const checkRow = () =>
{
    const guess = guessRows[currentRow].join('')
    if (currentTile > 4)
    {
            fetch(currenturl + `/check/?word=${guess}`)
            .then(response => response.json())
            .then(json => {
                if (json['Error'] == 'Entry word not found') {
                    showMessage('word not in list. Retry')
                    const x = document.getElementById('guessRow-' + currentRow).querySelectorAll(".tile")
                    x.forEach(element => element.textContent = '');
                    guessRows[currentRow].fill('', 0, 5);
                    x.forEach(element => element.setAttribute('data', ''));
                    currentTile = 0;
                    return
                }
                else {
                    flipTile()
                    if (wordle == guess) {
                        showMessage('Bingo!')
                        isGameOver = true
                        if (confirm('New Game?')) {
                            location.reload();
                        }
                        return
                    } else
                    {
                        if (currentRow >= 5) {
                            isGameOver = true
                            showMessage()
                            fetch(currenturl + `/definition/?word=${wordle.toLowerCase()}`)
                                .then(response => response.json())
                                .then(json => {
                                    var newLine = "\r\n";
                                    var msg = "Game Over !";
                                    msg += newLine;
                                    msg += "Le mot était: " + wordle;
                                    msg += newLine;
                                    msg += "Définition: " + json['Definition'];
                                    msg += newLine;
                                    msg += "Rejouez ?";
                                    if (confirm(msg)) {
                                        location.reload();
                                    }
                                })
                            return
                        }
                        if (currentRow < 5) {
                            currentRow++
                            currentTile = 0
                        }
                    }
                    
                }
            }).catch(err => console.log(err))
    }
}

const showMessage = (message) => {
    const messageElement = document.createElement('p')
    messageElement.textContent = message
    messageDisplay.append(messageElement)
    setTimeout(() => messageDisplay.removeChild(messageElement), 2000)
}

const showLongMessage = (message) => {
    const messageElement = document.createElement('p')
    messageElement.textContent = message
    messageDisplay.append(messageElement)
    setTimeout(() => messageDisplay.removeChild(messageElement), 10000)
}


const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter)
    key.classList.add(color)
}

const flipTile = () => {
    const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes
    let checkWordle = wordle
    const guess = []

    rowTiles.forEach(tile => {
        guess.push({ letter: tile.getAttribute('data'), color: 'grey-overlay' })
    })

    guess.forEach((guess, index) => {
        if (guess.letter == wordle[index]) {
            guess.color = 'green-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    guess.forEach(guess => {
        if (checkWordle.includes(guess.letter)) {
            guess.color = 'yellow-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    rowTiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('flip')
            tile.classList.add(guess[index].color)
            addColorToKey(guess[index].letter, guess[index].color)
        }, 500 * index)
    })
}

