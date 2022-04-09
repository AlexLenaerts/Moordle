const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.key-container')
const messageDisplay = document.querySelector('.message-container')

let played = 0;
let win = 0;
let currentStreak = 0;
let MaxStreak = 0;
let ratio = 0

let wordle
let currenturl = window.location.origin + '/Home/'
let definition
let old_timestamp = null


if (localStorage.getItem("played") !== null) {
    played = parseInt(localStorage['played'])
    win = parseInt(localStorage['Win'])
    currentStreak = parseInt(localStorage['currentStreak'])
    MaxStreak = parseInt(localStorage['MaxStreak'])
    if (played> 1){
        ratio = localStorage['ratio']
    }
}
document.getElementById('played').innerHTML = played
document.getElementById('currentStreak').innerHTML = currentStreak
document.getElementById('MaxStreak').innerHTML = MaxStreak
document.getElementById('ratio').innerHTML = ratio

const getWordle = () => {
    fetch(currenturl + 'Word')
        .then(response => response.json())
        .then(json => {
            wordle = json.toUpperCase()
        })
        .catch(err => console.log(err))
}
getWordle()

document.addEventListener("DOMContentLoaded", function (event) {
    document.querySelectorAll('[id^="guessRow-"][id*="tile"][class*="flip"]').forEach(el => el.style.color = "white");
    document.querySelectorAll('[class*= "overlay"]').forEach(el => el.style.color = "white");
    document.querySelectorAll('[id^="guessRow-"][id*="tile"]').forEach(element => element.style.fontweight = "bolder");
});


const keys = [
    'A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
    'W', 'X', 'C', 'V', 'B', 'N', '«', 'ENTER'
]

const FKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Escape']

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
    buttonElement.addEventListener('click', () => handleClick(key, event))
    if (count <= 9) {
        const line1 = document.querySelector('.line-1')
        line1.append(buttonElement);
    }
    else if (count > 9 && count <= 19) {
        const line2 = document.querySelector('.line-2')
        line2.append(buttonElement);
    }
    else {
        const line3 = document.querySelector('.line-3')
        line3.append(buttonElement);
    }
    count++
})

document.addEventListener('keydown',
    function (event) {
        if (event.keyCode == '8' || event.keyCode == '13') {
            handleClick(event.keyCode, event);
        }
        else if (!FKeys.includes(event.code)) {
            handleClick(String.fromCharCode(event.keyCode), event)
        }
    }, true);

const handleClick = (letter, event) => {
    if (!isGameOver) {
        if (letter == '8' || letter == '«') {
            deleteLetter()
            return
        }
        if ((letter == '13' || letter == 'ENTER') && (old_timestamp == null || old_timestamp + 1000 < event.timeStamp)) {
            old_timestamp = event.timeStamp
            checkRow()
            return
        }
        if (letter != 'ENTER' && letter != '13') {
            addLetter(letter)
        }
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

function DarkModeAlert() {
    let togg1 = document.getElementById("darkMode_on");
    if (togg1.style.display == "" || togg1.style.display == "block") {
        document.getElementsByClassName("swal-modal")[0].style.backgroundColor = "black";
        document.getElementsByClassName("swal-text")[0].style.color = "white";
    }
    else if (togg1.style.display == "none") {
        document.getElementsByClassName("swal-modal")[0].style.backgroundColor = "white";
        document.getElementsByClassName("swal-text")[0].style.color = "black";
    }
}

var link = document.createElement("div");
link.innerHTML = '<a onclick="setShareLinks()">Share score on Twitter</a>'

const checkRow = () => {
    const guess = guessRows[currentRow].join('')
    if (currentTile > 4) {
        fetch(currenturl + `/check/?word=${guess}`)
            .then(response => response.json())
            .then(json => {
                if (json == null) {
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
                        fetch(currenturl + `/definition/?word=${wordle.toLowerCase()}`)
                            .then(response => response.json())
                            .then(json => {
                                var newLine = "\r\n";
                                msg += newLine;
                                var msg = "Le mot était: " + wordle;
                                msg += newLine;
                                msg += "Définition: " + json;
                                msg += newLine;
                                msg += "Rejouez ?";
                                isGameOver = true
                                Victory(isGameOver)
                                swal({
                                    title: "Bingo !",
                                    content: link,
                                    text: msg,
                                    className: "title1",
                                    buttons: true,
                                    dangerMode: true,
                                })
                                    .then(DarkModeAlert())
                                    .then((willDelete) => {
                                        if (willDelete) {
                                            location.reload()
                                        }
                                    });
                            })
                        return
                    } else {
                        if (currentRow >= 5) {
                            isGameOver = true
                            showMessage()
                            fetch(currenturl + `/definition/?word=${wordle.toLowerCase()}`)
                                .then(response => response.json())
                                .then(json => {
                                    Victory(!isGameOver)
                                    var newLine = "\r\n";
                                    var msg = "Le mot était: " + wordle;
                                    msg += newLine;
                                    msg += "Définition: " + json;
                                    msg += newLine;
                                    msg += "Rejouez ?";
                                    msg += 
                                    swal({
                                        className: "title2",
                                        title: "Game Over !",
                                        text: msg,
                                        buttons: true,
                                        dangerMode: true,
                                    })
                                        .then(DarkModeAlert())
                                        .then((willDelete) => {
                                            if (willDelete) {
                                                location.reload()
                                            }
                                        });
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
    document.querySelectorAll('[class*= "overlay"]').forEach(el => el.style.color = "white");
}

const flipTile = () => {
    const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes

    let checkWordle = wordle
    const guess = []

    rowTiles.forEach(tile => {
        guess.push({ letter: tile.getAttribute('data'), color: 'grey-overlay' })
    })

    rowTiles.forEach(tile => tile.style.color = 'white')

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

function popup() {
    let togg1 = document.getElementById("panel-fenetre");
    document.getElementById("panel-fenetre2").style.display = "none";

    if (togg1.style.display == "none" || togg1.style.display == "") {
        togg1.style.display = "block";
    } else if (togg1.style.display == "block") {
        togg1.style.display = "none";
    }
}

function stats() {
    document.getElementById("panel-fenetre").style.display = "none";

    let togg1 = document.getElementById("panel-fenetre2");
    if (togg1.style.display == "none" || togg1.style.display == "") {
        togg1.style.display = "block";
    } else if (togg1.style.display == "block") {
        togg1.style.display = "none";
    }
}


function darkMode() {
    let togg1 = document.getElementById("darkMode_on");
    let title = document.getElementById("title").getElementsByTagName("h1")[0];
    let darkMode_on = document.querySelectorAll('[id=darkMode_on]');
    let darkMode_off = document.querySelectorAll('[id=darkMode_off]');
    let body = document.getElementsByTagName("body")[0];
    let helpWindows = document.getElementById("panel-fenetre");
    let statsWindows = document.getElementById("panel-fenetre2");


    if (togg1.style.display == "" || togg1.style.display == "block") {
        darkMode_on.forEach(element => element.style.display = "none");
        darkMode_off.forEach(element => element.style.display = "block");
        title.style.color = "black";
        body.style.backgroundColor = "white";
        helpWindows.style.backgroundColor = "white";
        helpWindows.style.borderColor = "black";
        statsWindows.style.backgroundColor = "white";
        statsWindows.style.borderColor = "black";
        document.getElementById("panel-fenetre-header").style.color = "black";
        document.getElementById("panel-fenetre-header").style.borderBottomColor = "black";
        document.getElementById("panel-fenetre-header2").style.color = "black";
        document.getElementById("panel-fenetre-header2").style.borderBottomColor = "black";
        document.getElementById("panel-fenetre-contenu").getElementsByTagName("p")[0].style.color = "black";
        document.getElementById("panel-fenetre-contenu").getElementsByTagName("ul")[0].style.color = "black";
        document.querySelectorAll("li").forEach(element => element.style.color = "black");
        document.getElementById("panel-fenetre-contenu2").getElementsByTagName("p")[0].style.color = "black";
        document.getElementById("copyright").style.color = "black";
        document.getElementById("copyright2").style.color = "black";
        document.querySelectorAll('[id="f"]').forEach(element => element.style.color = "black");
        document.querySelectorAll('[id="f"]').forEach(element => element.style.borderColor = "white");
        document.querySelectorAll('[id="ratio"]').forEach(element => element.style.borderColor = "white");
        document.querySelectorAll('[id="played"]').forEach(element => element.style.borderColor = "white");
        document.querySelectorAll('[id="MaxStreak"]').forEach(element => element.style.borderColor = "white");
        document.querySelectorAll('[id="ratio"]').forEach(element => element.style.color = "black");
        document.querySelectorAll('[id="played"]').forEach(element => element.style.color = "black");
        document.querySelectorAll('[id="currentStreak"]').forEach(element => element.style.color = "black");
        document.querySelectorAll('[id="MaxStreak"]').forEach(element => element.style.color = "black");
        document.querySelectorAll("button").forEach(element => element.style.color = "black");
        document.querySelectorAll("button").forEach(element => element.style.backgroundColor = "#d3d6da");
        document.querySelectorAll('[id^="guessRow-"][id*="tile"]').forEach(element => element.style.color = "black")
        document.querySelectorAll('[id="currentStreak"]').forEach(element => element.style.borderColor = "white");
        
    } else if (togg1.style.display == "none") {
        darkMode_on.forEach(element => element.style.display = "block");
        darkMode_off.forEach(element => element.style.display = "none");
        title.style.color = "white";
        body.style.backgroundColor = "black";
        helpWindows.style.backgroundColor = "black";
        helpWindows.style.borderColor = "white";
        statsWindows.style.backgroundColor = "black";
        statsWindows.style.borderColor = "white";
        document.getElementById("panel-fenetre-header").style.color = "white";
        document.getElementById("panel-fenetre-header").style.borderBottomColor = "white";
        document.getElementById("panel-fenetre-header2").style.color = "white";
        document.getElementById("panel-fenetre-header2").style.borderBottomColor = "white";
        document.getElementById("panel-fenetre-contenu").getElementsByTagName("p")[0].style.color = "white";
        document.getElementById("panel-fenetre-contenu2").getElementsByTagName("p")[0].style.color = "white";
        document.querySelectorAll("li").forEach(element => element.style.color = "white");
        document.getElementById("copyright").style.color = "white";
        document.getElementById("copyright2").style.color = "white";
        document.querySelectorAll('[id="f"]').forEach(element => element.style.color = "white");
        document.querySelectorAll('[id="ratio"]').forEach(element => element.style.color = "white");
        document.querySelectorAll('[id="played"]').forEach(element => element.style.color = "white");
        document.querySelectorAll('[id="currentStreak"]').forEach(element => element.style.color = "white");
        document.querySelectorAll('[id="MaxStreak"]').forEach(element => element.style.color = "white");
        document.querySelectorAll('[id="f"]').forEach(element => element.style.borderColor = "black");
        document.querySelectorAll('[id="ratio"]').forEach(element => element.style.borderColor = "black");
        document.querySelectorAll('[id="played"]').forEach(element => element.style.borderColor = "black");
        document.querySelectorAll('[id="currentStreak"]').forEach(element => element.style.borderColor = "black");
        document.querySelectorAll('[id="MaxStreak"]').forEach(element => element.style.borderColor = "black");
        document.querySelectorAll("button").forEach(element => element.style.color = "white");
        document.querySelectorAll("button").forEach(element => element.style.backgroundColor = "#818384");
        document.querySelectorAll('[id^="guessRow-"][id*="tile"]').forEach(element => element.style.color = "white")
    }
    document.querySelectorAll('[id^="guessRow-"][id*="tile"][class*="flip"]').forEach(el => el.style.color = "white");
    document.querySelectorAll('[class*= "overlay"]').forEach(el => el.style.color = "white");
    document.querySelectorAll('[id^="guessRow-"][id*="tile"]').forEach(element => element.style.fontweight = "bolder");

}

function Victory(isGameOver) {
    //win plusieurs fois
    if (isGameOver && played >= 1)
    {
        win = win + 1
        if (currentStreak >= MaxStreak) {
            localStorage['MaxStreak'] = currentStreak + 1
        }
        else
        {
            localStorage['MaxStreak'] = MaxStreak
        }
        localStorage['currentStreak'] = currentStreak + 1
        
        
    }
    //win première partie 
    else if (isGameOver && played == 0 )
    {
        win = win + 1
        localStorage['currentStreak'] = currentStreak + 1
        localStorage['MaxStreak'] = MaxStreak + 1
    }
    //lose première partie
    else if (!isGameOver && played == 0)
    {
        localStorage['MaxStreak'] = MaxStreak
        localStorage['currentStreak'] = 0
    }
    //compteur à zero 
    else if (!isGameOver)
    {
        localStorage['currentStreak'] = 0
        localStorage['MaxStreak'] = MaxStreak
    }
    played = played + 1
    localStorage['played'] = played
    localStorage['Win'] = win
    localStorage['ratio'] = ((win / played) * 100).toFixed(2)
}


function ShareScore()
{
    let row = ''
    let txt = ''
    let score = 0
    let count = 1
    let text2 = ''
    document.querySelectorAll('[class^="tile-container"]')[0].childNodes.forEach((ligne) =>
    {
        ligne.childNodes.forEach((tuile) => {
            if (tuile.classList.contains("yellow-overlay")) {
                row += '\uD83D\uDFE8'
            }
            else if (tuile.classList.contains("green-overlay")) {
                row += '\uD83D\uDFE9'
                score = score +1
            }
            else {
                row += '\u2B1B'
            }
        })
        if (score == 5) {
            text2 = text2 + count
            score = 0
        }
        else {
            score = 0
        }
        count += 1
        row += '%0a'
        txt += row
        row = ""
    })
    return txt
}

function ShareScorePoint()
{
    let score = 0
    let count = 1
    let text2 = ''
    document.querySelectorAll('[class^="tile-container"]')[0].childNodes.forEach((ligne) => {
        ligne.childNodes.forEach((tuile) => {
            if (tuile.classList.contains("green-overlay")) {
                score = score + 1
            }
        })
        if (score == 5) {
            text2 = text2 + count
            score = 0
        }
        else {
            score = 0
        }
        count += 1
    })
    return text2 + '/' + '6'

}


function socialWindow(url) {
    var left = (screen.width - 570) / 2;
    var top = (screen.height - 570) / 2;
    var params = "menubar=no,toolbar=no,status=no,width=570,height=570,top=" + top + ",left=" + left; window.open(url, "NewWindow", params);
}

function setShareLinks() {
    var pageUrl = encodeURIComponent('http://www.moordle.somee.com/');
    url = "https://twitter.com/intent/tweet?url=" + pageUrl + "&text=" + '%23' + "Moordle" + '%20' + ShareScorePoint() + '%0a' + ShareScore();
    socialWindow(url);
}


