const board = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');

let initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const pieceMap = {
    'r': '\u265C', 'n': '\u265E', 'b': '\u265D', 'q': '\u265B', 'k': '\u265A', 'p': '\u265F',
    'R': '\u2656', 'N': '\u2658', 'B': '\u2657', 'Q': '\u2655', 'K': '\u2654', 'P': '\u2659'
};

function renderBoard(boardState) {
    board.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((row + col) % 2 === 0 ? 'white' : 'black');
            square.dataset.row = row;
            square.dataset.col = col;
            const piece = boardState[row][col];
            if (piece) {
                const pieceElem = document.createElement('span');
                pieceElem.className = 'piece';
                pieceElem.textContent = pieceMap[piece];
                pieceElem.draggable = true;
                pieceElem.addEventListener('dragstart', onDragStart);
                pieceElem.addEventListener('dragend', onDragEnd);
                square.appendChild(pieceElem);
            }
            square.addEventListener('dragover', onDragOver);
            square.addEventListener('drop', onDrop);
            board.appendChild(square);
        }
    }
}

let selectedPiece = null;
let selectedSquare = null;

function onDragStart(event) {
    selectedPiece = event.target;
    selectedSquare = selectedPiece.parentElement;
}

function onDragEnd(event) {
    selectedPiece = null;
    selectedSquare = null;
}

function onDragOver(event) {
    event.preventDefault();
}

function onDrop(event) {
    event.preventDefault();
    const square = event.currentTarget;
    if (selectedPiece) {
        square.appendChild(selectedPiece);
        selectedPiece = null;
        selectedSquare = null;
    }
}

renderBoard(initialBoard)
