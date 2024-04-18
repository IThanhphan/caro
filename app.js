let inputDifficult = document.querySelector('.difficult_input');
let play_btn = document.querySelector('.play_btn');
let container = document.querySelector('.container');
let winner = document.querySelector('.winner');
let ID=0;
let win=0;
let isPlaying = 0;

const BOARD_SIZE = 9;
const BLOCK_SIZE = 100;
const FONT_SIZE = 70;
const ITEMS = [' ', 'x', 'o'];
const EMPTY_ID = 0;
const MINIMUM_ITEM = (BOARD_SIZE>5) ? 5 : 3;
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

container.setAttribute('style',`grid-template-columns: ${BOARD_SIZE * BLOCK_SIZE}px 200px`);

class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.grid = this.generateWhiteBoard();
        this.straightLine = Array(BOARD_SIZE).fill(EMPTY_ID);
        this.diagonalLine = Array(2*BOARD_SIZE-1).fill(EMPTY_ID);
        
        this.columnX = [...this.straightLine];
        this.rowX = [...this.straightLine];
        this.main_diagonalX = [...this.diagonalLine];
        this.secondary_diagonalX = [...this.diagonalLine];

        this.columnO = [...this.straightLine];
        this.rowO = [...this.straightLine];
        this.main_diagonalO = [...this.diagonalLine];
        this.secondary_diagonalO = [...this.diagonalLine];

        this.victoryAudio = new Audio('../sounds/success-fanfare-trumpets-6185.mp3');
        this.drawAudio = new Audio('../sounds/message-incoming-132126.mp3');
        this.tagAudio = new Audio('../sounds/tap-notification-180637.mp3');

        this.ctx.canvas.width = BOARD_SIZE * BLOCK_SIZE;
        this.ctx.canvas.height = BOARD_SIZE * BLOCK_SIZE;
    }

    generateWhiteBoard() {
        return Array.from({length: BOARD_SIZE}, () => Array(BOARD_SIZE).fill(EMPTY_ID));
    }

    reset() {
        winner.innerText = '';
        win = 0;
        ID = 0;
        this.ctx.canvas.width = BOARD_SIZE * BLOCK_SIZE;
        this.ctx.canvas.height = BOARD_SIZE * BLOCK_SIZE;

        this.columnX = [...this.straightLine];
        this.rowX = [...this.straightLine];
        this.main_diagonalX = [...this.diagonalLine];
        this.secondary_diagonalX = [...this.diagonalLine];

        this.columnO = [...this.straightLine];
        this.rowO = [...this.straightLine];
        this.main_diagonalO = [...this.diagonalLine];
        this.secondary_diagonalO = [...this.diagonalLine];

        this.grid = this.generateWhiteBoard();
        this.drawBoard();
        for (let row=0; row<this.grid.length; row++) {
            for (let col=0; col<this.grid[0].length; col++) {
                this.ctx.clearRect(row*BLOCK_SIZE+1, col*BLOCK_SIZE+1, BLOCK_SIZE-1, BLOCK_SIZE-1);
            }
        }
        
    }

    drawCell(x, y, itemId) {
        let text = ITEMS[itemId] || ITEMS[EMPTY_ID];
        this.ctx.font = `${FONT_SIZE}px Arial`;
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(text, (x*BLOCK_SIZE)+(BLOCK_SIZE/2), (y*BLOCK_SIZE)+FONT_SIZE);
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'black';
        this.ctx.strokeRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }

    drawBoard() {
        for (let row=0; row<this.grid.length; row++) {
            for (let col=0; col<this.grid[0].length; col++) {
                this.drawCell(col, row, this.grid[row][col]);
            }
        }
    }

    drawLine(xStart, yStart, xEnd, yEnd) {
        this.ctx.beginPath();
        this.ctx.moveTo(xStart*BLOCK_SIZE+BLOCK_SIZE/2, yStart*BLOCK_SIZE+BLOCK_SIZE/2); 
        this.ctx.lineTo(xEnd*BLOCK_SIZE+BLOCK_SIZE/2, yEnd*BLOCK_SIZE+BLOCK_SIZE/2);
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
    }

    updateX(x, y) {
        this.columnX[x] += 1;
        this.rowX[y] += 1;
        this.main_diagonalX[y-x+(BOARD_SIZE-1)] += 1;
        this.secondary_diagonalX[y+x] += 1;
    }

    updateY(x, y) {
        this.columnO[x] += 1;
        this.rowO[y] += 1;
        this.main_diagonalO[y-x+(BOARD_SIZE-1)] += 1;
        this.secondary_diagonalO[y+x] += 1;
    }

    updateBoard(x, y, itemId) {
        this.grid[y][x] = itemId;
        if (itemId === 1) {
            this.updateX(x, y);
        } else {
            this.updateY(x, y);
        }
    }

    checkRow(row, id) {
        let pre=0;
        let count = 0;
        for (let cur=0; cur<BOARD_SIZE; cur++) {
            console.log(`row ${row}:`, row, cur);
            if (this.grid[row][cur]===id) {
                count++;
            } else {
                count = 0;
                pre = cur + 1;
            }
            if (count==MINIMUM_ITEM) {
                this.drawLine(pre, row, cur, row)
                return true;
            }
        }
        return false;
    }

    checkColumn(column, id) {
        let pre=0;
        let count = 0;
        for (let cur=0; cur<BOARD_SIZE; cur++) {
            console.log(`column ${column}:`, cur, column);
            if (this.grid[cur][column]===id) {      
                count++;
            } else {
                count = 0;
                pre = cur + 1;
            }
            if (count==MINIMUM_ITEM) {
                this.drawLine(column, pre, column, cur);
                return true;
            }
        }
        return false;
    }

    checkMainDiagonal(md, id) {
        let pre = (md-BOARD_SIZE+1<=0) ? 0 : md-BOARD_SIZE+1;
        let count = 0;
        for (let cur=pre; cur<BOARD_SIZE; cur++) {
            console.log(`MainDiagonal ${md}:`, cur, cur-md+BOARD_SIZE-1);
            if (this.grid[cur][cur-md+BOARD_SIZE-1]===id) {
                count++;
            } else {
                count = 0;
                pre = cur + 1;
            }
            if (count == MINIMUM_ITEM) {
                this.drawLine(pre-md+BOARD_SIZE-1 ,pre, cur-md+BOARD_SIZE-1, cur);
                return true;
            }
        }
        return false;
    }
    checkSecondaryDiagonal(sd, id) {
        let pre = (sd-BOARD_SIZE+1<=0) ? 0 : sd-BOARD_SIZE+1;
        let count = 0;
        for (let cur=pre; cur<BOARD_SIZE; cur++) {
            console.log(`SecondaryDiagonal ${sd}:`, sd-cur, cur);
            if (this.grid[sd-cur][cur]===id) {
                count++;
            } else {
                count = 0;
                pre = cur + 1;
            }
            if (count == MINIMUM_ITEM) {
                this.drawLine(pre, sd-pre, cur, sd-cur);
                return true;
            }
        }
        return false;
    }

    isWin(itemId) {
        if (itemId === 1) {
            for (let i=0; i<BOARD_SIZE; i++) {
                if (this.columnX[i]>=MINIMUM_ITEM) {
                    if (this.checkColumn(i, itemId)) {
                        return true;
                    }    
                } else if (this.rowX[i]>=MINIMUM_ITEM) {
                    if (this.checkRow(i, itemId)) {
                        return true;
                    }
                }
            }
            for (let j=0; j<2*BOARD_SIZE-1; j++) {
                if (this.main_diagonalX[j]>=MINIMUM_ITEM) {
                    if (this.checkMainDiagonal(j, itemId)) {                 
                        return true;
                    }
                } else if (this.secondary_diagonalX[j]>=MINIMUM_ITEM) {
                    if (this.checkSecondaryDiagonal(j, itemId)) {
                        return true;
                    }
                }
            }
            return false;
        } else {
            for (let i=0; i<BOARD_SIZE; i++) {
                if (this.columnO[i]>=MINIMUM_ITEM) {
                    if (this.checkColumn(i, itemId)) {
                        return true;
                    }    
                } else if (this.rowO[i]>=MINIMUM_ITEM) {
                    if (this.checkRow(i, itemId)) {
                        return true;
                    }
                }
            }
            for (let j=0; j<2*BOARD_SIZE-1; j++) {
                if (this.main_diagonalO[j]>=MINIMUM_ITEM) {
                    if (this.checkMainDiagonal(j, itemId)) {
                        return true;
                    }
                } else if (this.secondary_diagonalO[j]>=MINIMUM_ITEM) {
                    if (this.checkSecondaryDiagonal(j, itemId)) {
                        return true;
                    }    
                }
            }
            return false;            
        }
    }

    notEmpty() {
        for (let row=0; row<this.grid.length; row++) {
            for (let col=0; col<this.grid[0].length; col++) {
                if (this.grid[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }
}

let board = new Board(ctx);
board.drawBoard();

canvas.addEventListener('click', function(e) {
    if (isPlaying) {
        board.tagAudio.play();
        let xPos, yPos;
        ID = (ID+1)%3 || 1;
        for (let i=0; i<BOARD_SIZE; i++) {
            if (e.pageX>=this.offsetLeft+(BLOCK_SIZE*i) && e.pageX<=this.offsetLeft+(BLOCK_SIZE*(i+1))) {
                xPos = i;
            }
            if (e.pageY>=this.offsetTop+(BLOCK_SIZE*i) && e.pageY<=this.offsetTop+(BLOCK_SIZE*(i+1))) {
                yPos = i;
            }
        }
        if (board.grid[yPos][xPos] === EMPTY_ID) {
            if (win === 0 || win === 1) {
                board.updateBoard(xPos, yPos, ID);
            }
            if (board.isWin(ID)) {
                win++;
            } 
            if (win === 1) {
                win++;
                board.drawCell(xPos, yPos, ID);
                winner.innerText = `Player ${ITEMS[ID]} win!!!`;
                board.victoryAudio.play();
                isPlaying = 0;
            } else if (win === 0) {
                board.drawCell(xPos, yPos, ID); 
                if (board.notEmpty()) {
                    winner.innerText = 'Draw!!!';
                    board.drawAudio.play();
                    isPlaying = 0;
                }     
            }
        }
    }
})

play_btn.addEventListener('click', function(e) {
    isPlaying = 1;
    board.reset();
})





