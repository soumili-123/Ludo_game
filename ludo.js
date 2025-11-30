const canvas = document.getElementById('ludoBoard');
const ctx = canvas.getContext('2d');

const CELL = 40;
const TOKEN_RADIUS = 12;
const PLAYER_COLORS = ['red', 'green', 'yellow', 'blue'];
let currentPlayer = 0;
let diceRoll = 0;
let extraTurn = false;

const currentPlayerSpan = document.getElementById('currentPlayer');
const diceValueSpan = document.getElementById('diceValue');
const messageDiv = document.getElementById('message');

// ------------------ Board ------------------
let mainPath = []; // 52 positions
let homePaths = [[], [], [], []]; // 6 positions each
let safePositions = [0, 8, 13, 21, 26, 34, 39, 47]; // classic safe zones

function generatePaths() {
    // main circular path 52 steps
    const positions = [
        [0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0],
        [7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[9,6],[10,6],[11,6],[12,6],[13,6],
        [14,6],[14,7],[14,8],[13,8],[12,8],[11,8],[10,8],[9,9],[8,9],[8,10],[8,11],[8,12],
        [8,13],[7,14],[6,14],[6,13],[6,12],[6,11],[6,10],[5,9],[4,9],[3,9],[2,9],[1,9],[0,9]
    ];
    mainPath = positions.map(p => [p[0]*CELL, p[1]*CELL]);

    // home paths (6 steps towards center)
    homePaths[0] = [[1*CELL,6*CELL],[2*CELL,6*CELL],[3*CELL,6*CELL],[4*CELL,6*CELL],[5*CELL,6*CELL],[6*CELL,6*CELL]]; // red
    homePaths[1] = [[8*CELL,1*CELL],[8*CELL,2*CELL],[8*CELL,3*CELL],[8*CELL,4*CELL],[8*CELL,5*CELL],[8*CELL,6*CELL]]; // green
    homePaths[2] = [[13*CELL,8*CELL],[12*CELL,8*CELL],[11*CELL,8*CELL],[10*CELL,8*CELL],[9*CELL,8*CELL],[8*CELL,8*CELL]]; // yellow
    homePaths[3] = [[6*CELL,13*CELL],[6*CELL,12*CELL],[6*CELL,11*CELL],[6*CELL,10*CELL],[6*CELL,9*CELL],[6*CELL,8*CELL]]; // blue
}
generatePaths();

// ------------------ Tokens ------------------
class Token {
    constructor(color, homeX, homeY, entryIndex) {
        this.color = color;
        this.pos = -1; // -1 = home, 0-51 = main path, 52-57 = home path
        this.homeX = homeX;
        this.homeY = homeY;
        this.entryIndex = entryIndex; // starting path index
        this.pixel = [homeX, homeY];
        this.moving = false;
        this.stepsToMove = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.pixel[0]+CELL/2, this.pixel[1]+CELL/2, TOKEN_RADIUS, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }

    moveStep(steps, callback) {
        if(steps === 0) { callback(); return; }
        this.stepsToMove = steps;
        this.moving = true;

        const stepMove = () => {
            if(this.stepsToMove <= 0) {
                this.moving = false;
                callback();
                return;
            }

            if(this.pos === -1) { // leave home
                this.pos = this.entryIndex;
            } else if(this.pos < 52) { // main path
                this.pos++;
                if(this.pos >= 52) this.pos = 52; // start home path
            } else if(this.pos >= 52) { // home path
                let homeStep = this.pos-52;
                if(homeStep < 5) this.pos++;
            }

            this.updatePixel();
            this.stepsToMove--;
            setTimeout(stepMove, 200);
        };
        stepMove();
    }

    updatePixel() {
        if(this.pos === -1) this.pixel = [this.homeX, this.homeY];
        else if(this.pos < 52) this.pixel = [...mainPath[this.pos]];
        else {
            let homeStep = this.pos-52;
            this.pixel = [...homePaths[PLAYER_COLORS.indexOf(this.color)][homeStep]];
        }
    }
}

// Token creation
let tokens = [];
tokens.push([
    new Token('red', CELL, CELL, 0),
    new Token('red', CELL*3, CELL, 0),
    new Token('red', CELL, CELL*3, 0),
    new Token('red', CELL*3, CELL*3, 0)
]);
tokens.push([
    new Token('green', CELL*10, CELL, 13),
    new Token('green', CELL*12, CELL, 13),
    new Token('green', CELL*10, CELL*3, 13),
    new Token('green', CELL*12, CELL*3, 13)
]);
tokens.push([
    new Token('yellow', CELL*10, CELL*10, 26),
    new Token('yellow', CELL*12, CELL*10, 26),
    new Token('yellow', CELL*10, CELL*12, 26),
    new Token('yellow', CELL*12, CELL*12, 26)
]);
tokens.push([
    new Token('blue', CELL, CELL*10, 39),
    new Token('blue', CELL*3, CELL*10, 39),
    new Token('blue', CELL, CELL*12, 39),
    new Token('blue', CELL*3, CELL*12, 39)
]);

// ------------------ Board Draw ------------------
function drawBoard() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=0;i<15;i++){
        for(let j=0;j<15;j++){
            ctx.strokeStyle='#333';
            ctx.strokeRect(j*CELL,i*CELL,CELL,CELL);
        }
    }
    ctx.fillStyle='red'; ctx.fillRect(0,0,CELL*6,CELL*6);
    ctx.fillStyle='green'; ctx.fillRect(CELL*9,0,CELL*6,CELL*6);
    ctx.fillStyle='yellow'; ctx.fillRect(CELL*9,CELL*9,CELL*6,CELL*6);
    ctx.fillStyle='blue'; ctx.fillRect(0,CELL*9,CELL*6,CELL*6);
    ctx.fillStyle='white'; ctx.fillRect(CELL*6,CELL*6,CELL*3,CELL*3);
}

// ------------------ Dice ------------------
function rollDice() {
    if(tokens[currentPlayer].some(t=>t.moving)) return;
    diceRoll = Math.floor(Math.random()*6)+1;
    diceValueSpan.innerText = diceRoll;
    messageDiv.innerText = `${PLAYER_COLORS[currentPlayer]} rolled ${diceRoll}. Click a token to move.`;
}

// ------------------ Click to move ------------------
canvas.addEventListener('click', e=>{
    if(diceRoll === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const playerTokens = tokens[currentPlayer];
    for(let t of playerTokens){
        let tx = t.pixel[0]+CELL/2;
        let ty = t.pixel[1]+CELL/2;
        if(Math.hypot(tx-x, ty-y) <= TOKEN_RADIUS && !t.moving){
            // Check if can move
            if(t.pos === -1 && diceRoll !== 6) {
                messageDiv.innerText = "You need 6 to move a token out!";
                return;
            }
            t.moveStep(diceRoll, ()=>{
                checkCapture(t);
                checkWin();
                if(diceRoll!==6) nextPlayer();
                else messageDiv.innerText = `${PLAYER_COLORS[currentPlayer]} rolled 6! Roll again.`;
                diceRoll = 0;
            });
            break;
        }
    }
});

// ------------------ Capture ------------------
function checkCapture(movedToken){
    for(let p=0;p<tokens.length;p++){
        if(p===currentPlayer) continue;
        for(let t of tokens[p]){
            if(t.pos===movedToken.pos && t.pos<52 && !safePositions.includes(t.pos)){
                t.pos=-1;
                t.pixel=[t.homeX,t.homeY];
                messageDiv.innerText += ` ${PLAYER_COLORS[p]} token captured!`;
            }
        }
    }
}

// ------------------ Next Player ------------------
function nextPlayer(){
    currentPlayer = (currentPlayer+1)%4;
    currentPlayerSpan.innerText = PLAYER_COLORS[currentPlayer];
}

// ------------------ Win ------------------
function checkWin(){
    const playerTokens = tokens[currentPlayer];
    if(playerTokens.every(t=>t.pos>=58)){
        messageDiv.innerText = `${PLAYER_COLORS[currentPlayer]} Wins! 🎉`;
        document.getElementById('rollDiceBtn').disabled=true;
    }
}

// ------------------ Game Loop ------------------
function gameLoop(){
    drawBoard();
    for(let playerTokens of tokens){
        for(let t of playerTokens) t.draw();
    }
    requestAnimationFrame(gameLoop);
}

document.getElementById('rollDiceBtn').addEventListener('click', rollDice);
gameLoop();
