const board = document.getElementById('board');

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

let selectedPiece = null;
let selectedSquare = null;

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
                pieceElem.addEventListener('click', onPieceClick);
                pieceElem.addEventListener('dragstart', onDragStart);
                pieceElem.addEventListener('dragend', onDragEnd);
                square.appendChild(pieceElem);
            }
            square.addEventListener('click', onSquareClick);
            square.addEventListener('dragover', onDragOver);
            square.addEventListener('drop', onDrop);
            board.appendChild(square);
        }
    }
}

function onDragStart(event) {
    const pieceElem = event.target;
    const square = pieceElem.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    selectedPiece = initialBoard[row][col];
    selectedSquare = square;
    highlightSquare(square);

    event.dataTransfer.setData('text/plain', `${row},${col}`);
}

function onDragEnd(event) {
    clearHighlights();
}

function onDragOver(event) {
    event.preventDefault();
}

function onDrop(event) {
    event.preventDefault();
    const [fromRow, fromCol] = event.dataTransfer.getData('text/plain').split(',').map(Number);
    const toRow = parseInt(event.currentTarget.dataset.row);
    const toCol = parseInt(event.currentTarget.dataset.col);

    // Check if the drop is on the same square
    if (fromRow === toRow && fromCol === toCol) {
        return;
    }

    if (initialBoard[fromRow][fromCol]) {
        initialBoard[toRow][toCol] = initialBoard[fromRow][fromCol];
        initialBoard[fromRow][fromCol] = '';
        renderBoard(initialBoard);
    }
}

function onPieceClick(event) {
    const pieceElem = event.target;
    const square = pieceElem.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    if (selectedPiece && selectedSquare !== square) {
        const fromRow = parseInt(selectedSquare.dataset.row);
        const fromCol = parseInt(selectedSquare.dataset.col);

        // Check if the piece on the target square is of the opposite color
        if (isOppositeColor(selectedPiece, initialBoard[row][col])) {
            initialBoard[row][col] = selectedPiece;
            initialBoard[fromRow][fromCol] = '';
            selectedPiece = null;
            selectedSquare = null;
            clearHighlights();
            renderBoard(initialBoard);
        } else {
            selectedPiece = initialBoard[row][col];
            selectedSquare = square;
            clearHighlights();
            highlightSquare(square);
        }
    } else {
        selectedPiece = initialBoard[row][col];
        selectedSquare = square;
        clearHighlights();
        highlightSquare(square);
    }
}

function onSquareClick(event) {
    const square = event.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    if (selectedPiece && selectedSquare !== square) {
        const fromRow = parseInt(selectedSquare.dataset.row);
        const fromCol = parseInt(selectedSquare.dataset.col);
        initialBoard[row][col] = selectedPiece;
        initialBoard[fromRow][fromCol] = '';
        selectedPiece = null;
        selectedSquare = null;
        clearHighlights();
        renderBoard(initialBoard);
    }
}

function highlightSquare(square) {
    square.classList.add('highlight');
}

function clearHighlights() {
    const highlightedSquares = document.querySelectorAll('.square.highlight');
    highlightedSquares.forEach(square => {
        square.classList.remove('highlight');
    });
}

function isOppositeColor(piece1, piece2) {
    if (!piece1 || !piece2) return false;
    return (piece1 === piece1.toUpperCase() && piece2 === piece2.toLowerCase()) ||
        (piece1 === piece1.toLowerCase() && piece2 === piece2.toUpperCase());
}

renderBoard(initialBoard);
