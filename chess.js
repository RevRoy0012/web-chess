const board = document.getElementById('board');
const capturedWhiteContainer = document.getElementById('captured-white');
const capturedBlackContainer = document.getElementById('captured-black');

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
                pieceElem.addEventListener('mouseenter', onPieceHover);
                pieceElem.addEventListener('mouseleave', onPieceLeave);
                square.appendChild(pieceElem);
            }
            square.addEventListener('click', onSquareClick);
            square.addEventListener('dragover', onDragOver);
            square.addEventListener('drop', onDrop);
            board.appendChild(square);
        }
    }
}

function onPieceHover(event) {
    const pieceElem = event.target;
    const square = pieceElem.parentElement;
    square.classList.add('hover');
}

function onPieceLeave(event) {
    const pieceElem = event.target;
    const square = pieceElem.parentElement;
    square.classList.remove('hover');
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

    if (fromRow === toRow && fromCol === toCol) {
        return;
    }

    if (initialBoard[fromRow][fromCol] && !isSameColor(initialBoard[fromRow][fromCol], initialBoard[toRow][toCol])) {
        if (initialBoard[toRow][toCol]) {
            capturePiece(initialBoard[toRow][toCol]);
        }
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

        if (!isSameColor(selectedPiece, initialBoard[row][col])) {
            if (initialBoard[row][col]) {
                capturePiece(initialBoard[row][col]);
            }
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

        if (!isSameColor(selectedPiece, initialBoard[row][col])) {
            if (initialBoard[row][col]) {
                capturePiece(initialBoard[row][col]);
            }
            initialBoard[row][col] = selectedPiece;
            initialBoard[fromRow][fromCol] = '';
            selectedPiece = null;
            selectedSquare = null;
            clearHighlights();
            renderBoard(initialBoard);
        }
    }
}

function capturePiece(piece) {
    const capturedPieceElem = document.createElement('div');
    capturedPieceElem.className = 'captured';
    capturedPieceElem.textContent = pieceMap[piece];
    capturedPieceElem.addEventListener('click', () => {
        // Add back to the board if clicked
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (initialBoard[row][col] === '') {
                    initialBoard[row][col] = piece;
                    renderBoard(initialBoard);
                    capturedPieceElem.remove();
                    return;
                }
            }
        }
    });

    if (piece === piece.toUpperCase()) {
        capturedWhiteContainer.appendChild(capturedPieceElem);
    } else {
        capturedBlackContainer.appendChild(capturedPieceElem);
    }
}

function highlightSquare(square) {
    square.classList.add('highlight');
}

function clearHighlights() {
    const highlightedSquares = document.querySelectorAll('.square.highlight, .square.hover');
    highlightedSquares.forEach(square => {
        square.classList.remove('highlight', 'hover');
    });
}

function isSameColor(piece1, piece2) {
    if (!piece1 || !piece2) return false;
    return (piece1 === piece1.toUpperCase() && piece2 === piece2.toUpperCase()) ||
        (piece1 === piece1.toLowerCase() && piece2 === piece2.toLowerCase());
}

renderBoard(initialBoard);
