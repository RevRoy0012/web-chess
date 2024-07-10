const board = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');
const capturedByWhite = document.getElementById('captured-by-white');
const capturedByBlack = document.getElementById('captured-by-black');
const restartButton = document.getElementById('restart-button');
const messageBox = document.getElementById('message-box');

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
let turn = 'white';
let capturedPiecesWhite = [];
let capturedPiecesBlack = [];
let whiteKingMoved = false;
let blackKingMoved = false;
let whiteRookMoved = [false, false]; // left, right
let blackRookMoved = [false, false]; // left, right

function showMessage(message) {
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        setTimeout(() => {
            hideMessage();
        }, 2000);
    }
}

function hideMessage() {
    if (messageBox) {
        messageBox.style.display = 'none';
    }
}

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
            square.addEventListener('click', onSquareClick);
            square.addEventListener('dragover', onDragOver);
            square.addEventListener('drop', onDrop);
            board.appendChild(square);
        }
    }
    updateTurnIndicator();
    renderCapturedPieces();
}

function onSquareClick(event) {
    const square = event.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    if (selectedPiece && selectedSquare === square) {
        // Deselect piece if the same square is clicked
        selectedPiece = null;
        selectedSquare = null;
        clearHighlights();
    } else if (selectedPiece) {
        const fromRow = parseInt(selectedSquare.dataset.row);
        const fromCol = parseInt(selectedSquare.dataset.col);
        if (isValidMove(selectedPiece, fromRow, fromCol, row, col)) {
            makeMove(selectedPiece, fromRow, fromCol, row, col);
        }
    } else if (initialBoard[row][col] && isCorrectTurn(initialBoard[row][col])) {
        selectedPiece = initialBoard[row][col];
        selectedSquare = square;
        highlightMoves(selectedPiece, row, col);
    }
}

function isValidMove(piece, fromRow, fromCol, toRow, toCol) {
    if (initialBoard[toRow][toCol] && isCorrectTurn(initialBoard[toRow][toCol])) {
        return false; // Can't capture own piece
    }

    const direction = piece === piece.toUpperCase() ? -1 : 1; // White moves up, black moves down
    const isPawn = piece.toLowerCase() === 'p';
    const isKnight = piece.toLowerCase() === 'n';
    const isBishop = piece.toLowerCase() === 'b';
    const isRook = piece.toLowerCase() === 'r';
    const isQueen = piece.toLowerCase() === 'q';
    const isKing = piece.toLowerCase() === 'k';

    if (isPawn) {
        if (fromCol === toCol && initialBoard[toRow][toCol] === '') {
            if ((fromRow + direction === toRow) ||
                (fromRow + 2 * direction === toRow && fromRow === (direction === 1 ? 1 : 6) && initialBoard[fromRow + direction][fromCol] === '')) {
                return true;
            }
        }
        if (Math.abs(fromCol - toCol) === 1 && fromRow + direction === toRow && initialBoard[toRow][toCol] && !isCorrectTurn(initialBoard[toRow][toCol])) {
            return true;
        }
    }

    if (isKnight) {
        const knightMoves = [
            [fromRow + 2, fromCol + 1], [fromRow + 2, fromCol - 1],
            [fromRow - 2, fromCol + 1], [fromRow - 2, fromCol - 1],
            [fromRow + 1, fromCol + 2], [fromRow + 1, fromCol - 2],
            [fromRow - 1, fromCol + 2], [fromRow - 1, fromCol - 2]
        ];
        return knightMoves.some(([r, c]) => r === toRow && c === toCol && (initialBoard[r][c] === '' || !isCorrectTurn(initialBoard[r][c])));
    }

    if (isBishop || isQueen) {
        if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
            const rowStep = toRow > fromRow ? 1 : -1;
            const colStep = toCol > fromCol ? 1 : -1;
            let r = fromRow + rowStep;
            let c = fromCol + colStep;
            while (r !== toRow && c !== toCol) {
                if (initialBoard[r][c] !== '') return false;
                r += rowStep;
                c += colStep;
            }
            return initialBoard[toRow][toCol] === '' || !isCorrectTurn(initialBoard[toRow][toCol]);
        }
    }

    if (isRook || isQueen) {
        if (fromRow === toRow || fromCol === toCol) {
            const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
            const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);
            let r = fromRow + rowStep;
            let c = fromCol + colStep;
            while (r !== toRow || c !== toCol) {
                if (initialBoard[r][c] !== '') return false;
                r += rowStep;
                c += colStep;
            }
            return initialBoard[toRow][toCol] === '' || !isCorrectTurn(initialBoard[toRow][toCol]);
        }
    }

    if (isKing) {
        if (Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1) {
            return initialBoard[toRow][toCol] === '' || !isCorrectTurn(initialBoard[toRow][toCol]);
        }
        if (!hasKingMoved(piece) && (fromCol - toCol === 2 || toCol - fromCol === 2) && fromRow === toRow) {
            return canCastle(piece, fromRow, fromCol, toRow, toCol);
        }
    }

    return false;
}

function canCastle(piece, fromRow, fromCol, toRow, toCol) {
    if (piece.toLowerCase() !== 'k') return false;
    const isWhite = piece === 'K';
    const row = isWhite ? 7 : 0;
    const rookCol = fromCol > toCol ? 0 : 7;
    const rook = initialBoard[row][rookCol];
    if (!rook || rook.toLowerCase() !== 'r' || hasRookMoved(rook, row, rookCol)) return false;

    const colStep = toCol > fromCol ? 1 : -1;
    for (let col = fromCol + colStep; col !== rookCol; col += colStep) {
        if (initialBoard[row][col] !== '') return false;
    }

    return true;
}

function hasKingMoved(piece) {
    return piece === 'K' ? whiteKingMoved : blackKingMoved;
}

function hasRookMoved(piece, row, col) {
    if (piece === 'R') return whiteRookMoved[col === 0 ? 0 : 1];
    if (piece === 'r') return blackRookMoved[col === 0 ? 0 : 1];
    return false;
}

function makeMove(piece, fromRow, fromCol, toRow, toCol) {
    if (initialBoard[toRow][toCol]) {
        capturePiece(initialBoard[toRow][toCol]);
    }
    initialBoard[toRow][toCol] = piece;
    initialBoard[fromRow][fromCol] = '';
    if (piece.toLowerCase() === 'k') {
        if (piece === 'K') whiteKingMoved = true;
        if (piece === 'k') blackKingMoved = true;
        if (fromCol - toCol === 2) {
            initialBoard[fromRow][3] = initialBoard[fromRow][0];
            initialBoard[fromRow][0] = '';
            whiteRookMoved[0] = true;
        }
        if (toCol - fromCol === 2) {
            initialBoard[fromRow][5] = initialBoard[fromRow][7];
            initialBoard[fromRow][7] = '';
            whiteRookMoved[1] = true;
        }
    }
    if (piece.toLowerCase() === 'r') {
        if (piece === 'R') whiteRookMoved[fromCol === 0 ? 0 : 1] = true;
        if (piece === 'r') blackRookMoved[fromCol === 0 ? 0 : 1] = true;
    }
    selectedPiece = null;
    selectedSquare = null;
    clearHighlights();
    toggleTurn();
    renderBoard(initialBoard);
    checkGameState();
}

function highlightMoves(piece, row, col) {
    clearHighlights();
    const possibleMoves = getPossibleMoves(piece, row, col);
    possibleMoves.forEach(move => {
        const square = document.querySelector(`.square[data-row='${move[0]}'][data-col='${move[1]}']`);
        if (square) {
            square.classList.add('valid-move');
        }
    });
}

function clearHighlights() {
    const highlightedSquares = document.querySelectorAll('.square.highlight, .square.valid-move');
    highlightedSquares.forEach(square => {
        square.classList.remove('highlight', 'valid-move');
    });
}

function getPossibleMoves(piece, row, col) {
    const moves = [];
    for (let toRow = 0; toRow < 8; toRow++) {
        for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(piece, row, col, toRow, toCol)) {
                moves.push([toRow, toCol]);
            }
        }
    }
    return moves;
}

function updateTurnIndicator() {
    turnIndicator.textContent = `Turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`;
}

function toggleTurn() {
    turn = turn === 'white' ? 'black' : 'white';
}

function isCorrectTurn(piece) {
    return (turn === 'white' && piece === piece.toUpperCase()) || (turn === 'black' && piece === piece.toLowerCase());
}

function capturePiece(piece) {
    if (piece === piece.toUpperCase()) {
        capturedPiecesWhite.push(piece);
    } else {
        capturedPiecesBlack.push(piece);
    }
}

function renderCapturedPieces() {
    capturedByWhite.innerHTML = capturedPiecesWhite.map(piece => pieceMap[piece]).join(' ');
    capturedByBlack.innerHTML = capturedPiecesBlack.map(piece => pieceMap[piece]).join(' ');
}

function onDragStart(event) {
    const pieceElem = event.target;
    const row = pieceElem.parentElement.dataset.row;
    const col = pieceElem.parentElement.dataset.col;
    if (isCorrectTurn(initialBoard[row][col])) {
        selectedPiece = initialBoard[row][col];
        selectedSquare = pieceElem.parentElement;
        highlightMoves(selectedPiece, row, col);
    } else {
        event.preventDefault();
    }
}

function onDragEnd(event) {
    clearHighlights();
}

function onDragOver(event) {
    event.preventDefault();
}

function onDrop(event) {
    event.preventDefault();
    const square = event.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    if (selectedPiece) {
        const fromRow = parseInt(selectedSquare.dataset.row);
        const fromCol = parseInt(selectedSquare.dataset.col);
        if (isValidMove(selectedPiece, fromRow, fromCol, row, col)) {
            makeMove(selectedPiece, fromRow, fromCol, row, col);
        }
    }
}

function showAllValidMoves() {
    clearHighlights();
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = initialBoard[row][col];
            if (piece && isCorrectTurn(piece)) {
                highlightMoves(piece, row, col);
            }
        }
    }
}

function restartGame() {
    initialBoard = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    selectedPiece = null;
    selectedSquare = null;
    turn = 'white';
    capturedPiecesWhite = [];
    capturedPiecesBlack = [];
    whiteKingMoved = false;
    blackKingMoved = false;
    whiteRookMoved = [false, false];
    blackRookMoved = [false, false];
    renderBoard(initialBoard);
    hideMessage();
}

restartButton.addEventListener('click', restartGame);

function isCheck(turn) {
    const kingPosition = findKing(turn);
    if (!kingPosition) return false;

    const opponent = turn === 'white' ? 'black' : 'white';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (initialBoard[row][col] && !isCorrectTurn(initialBoard[row][col]) && isValidMove(initialBoard[row][col], row, col, kingPosition[0], kingPosition[1])) {
                return true;
            }
        }
    }
    return false;
}

function findKing(turn) {
    const king = turn === 'white' ? 'K' : 'k';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (initialBoard[row][col] === king) {
                return [row, col];
            }
        }
    }
    return null;
}

function isCheckmate(turn) {
    if (!isCheck(turn)) return false;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (initialBoard[row][col] && isCorrectTurn(initialBoard[row][col])) {
                const piece = initialBoard[row][col];
                const moves = getPossibleMoves(piece, row, col);
                for (const move of moves) {
                    const [toRow, toCol] = move;
                    const tempPiece = initialBoard[toRow][toCol];
                    initialBoard[toRow][toCol] = piece;
                    initialBoard[row][col] = '';
                    const check = isCheck(turn);
                    initialBoard[toRow][toCol] = tempPiece;
                    initialBoard[row][col] = piece;
                    if (!check) return false;
                }
            }
        }
    }
    return true;
}

function isStalemate(turn) {
    if (isCheck(turn)) return false;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (initialBoard[row][col] && isCorrectTurn(initialBoard[row][col])) {
                const piece = initialBoard[row][col];
                const moves = getPossibleMoves(piece, row, col);
                for (const move of moves) {
                    const [toRow, toCol] = move;
                    const tempPiece = initialBoard[toRow][toCol];
                    initialBoard[toRow][toCol] = piece;
                    initialBoard[row][col] = '';
                    const check = isCheck(turn);
                    initialBoard[toRow][toCol] = tempPiece;
                    initialBoard[row][col] = piece;
                    if (!check) return false;
                }
            }
        }
    }
    return true;
}

function checkGameState() {
    if (isCheckmate(turn)) {
        showMessage(`Checkmate! ${turn.charAt(0).toUpperCase() + turn.slice(1)} loses.`);
    } else if (isStalemate(turn)) {
        showMessage(`Stalemate! The game is a draw.`);
    } else if (isCheck(turn)) {
        showMessage(`Check! ${turn.charAt(0).toUpperCase() + turn.slice(1)} is in check.`);
    } else {
        hideMessage();
    }
}

renderBoard(initialBoard);
