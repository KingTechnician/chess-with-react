import { useState, useMemo, useCallback, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import CustomDialog from "./components/CustomDialog";

function fenToBoard(fen) {
  const parts = fen.split(' ')[0]; // get only the pieces part of the FEN
  const ranks = parts.split('/');
  const rows = ranks.map((rank) => {
    return rank.replace(/[1-8]/g, (match) => ' '.repeat(match))
               .replace('p', '♟').replace('r', '♜').replace('n', '♞')
               .replace('b', '♝').replace('q', '♛').replace('k', '♚')
               .replace('P', '♙').replace('R', '♖').replace('N', '♘')
               .replace('B', '♗').replace('Q', '♕').replace('K', '♔');
  });

  return rows.join('\n') + '\n';
}

function countPiecesFromFEN(fen) {
  // Initial empty counts for all pieces
  const counts = {
    'w': { 'P': 0, 'N': 0, 'B': 0, 'R': 0, 'Q': 0, 'K': 0 },
    'b': { 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0, 'k': 0 },
    'turn': ''
  };

  // Split the FEN string into its main parts
  const [position, turn] = fen.split(' ');

  // Update whose turn it is
  counts.turn = turn === 'w' ? 'White' : 'Black';

  // Count each piece by going through the position part of the FEN
  for (const char of position) {
    if (char in counts.w || char in counts.b) {
      char === char.toUpperCase() ? counts.w[char]++ : counts.b[char]++;
    }
  }

  return counts;
}


function Game({ players, room, orientation, cleanup }) {
  const chess = useMemo(() => new Chess(), []); // <- 1
  const [fen, setFen] = useState(chess.fen()); // <- 2
  const [over, setOver] = useState("");
  const pieceCounts = useMemo(() => countPiecesFromFEN(fen), [fen]);

  // onDrop function

  const makeAMove = useCallback(
    (move) => {
      console.log(move)
        try{
            const result = chess.move(move);
            console.log("Move: ",move,result)
            setFen(chess.fen());
            console.log(chess.fen())
            console.log(countPiecesFromFEN(chess.fen()))

            console.log("over, checkmate", chess.isGameOver(),chess.isCheckmate());

            if(chess.isGameOver())
            {
                if(chess.isCheckmate())
                {
                    setOver(`Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`)
                }
                else if (chess.isDraw())
                {
                    setOver("Draw")
                }
                else
                {
                    setOver("Game over");
                }
            }
            return result;
        } catch(e) {
            return null;
        }
    },
    [chess]
  )

  function onDrop(sourceSquare,targetSquare) 
  {
    const moveData = {
        from: sourceSquare,
        to:targetSquare,
        color: chess.turn()

    }

    const move = makeAMove(moveData);

    if (move===null) return false;

    return true;
  } // <- 3
  
  // Game component returned jsx
  return (
    <div className="game-container">
      <div className="pieces-display">
        <h3>White Pieces</h3>
        {Object.entries(pieceCounts.w).map(([piece, count]) => (
          <div key={piece}>{`${piece}: ${count}`}</div>
        ))}
      </div>

      <div className="board">
        <Chessboard position={fen} onPieceDrop={onDrop} />
      </div>

      <div className="pieces-display">
        <h3>Black Pieces</h3>
        {Object.entries(pieceCounts.b).map(([piece, count]) => (
          <div key={piece}>{`${piece}: ${count}`}</div>
        ))}
      </div>

      <div className="turn-display">
        <h2>Turn: {pieceCounts.turn}</h2>
      </div>

      <CustomDialog
        open={Boolean(over)}
        title={over}
        contentText={over}
        handleContinue={() => {
          setOver('');
          setFen(chess.reset());
        }}
      />
    </div>
  );
}

export default Game;