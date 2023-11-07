import { useState, useMemo, useCallback, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import CustomDialog from "./components/CustomDialog";

function Game({ players, room, orientation, cleanup }) {
  const chess = useMemo(() => new Chess(), []); // <- 1
  const [fen, setFen] = useState(chess.fen()); // <- 2
  const [over, setOver] = useState("");

  // onDrop function

  const makeAMove = useCallback(
    (move) => {
        try{
            const result = chess.move(move);
            console.log("Move: ",move,result)
            setFen(chess.fen());

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
    <>
      <div className="board">
        <Chessboard position={fen} onPieceDrop={onDrop} />  {/**  <- 4 */}
      </div>
      <CustomDialog // <- 5
        open={Boolean(over)}
        title={over}
        contentText={over}
        handleContinue={() => {
          setOver("");
        }}
      />
    </>
  );
}

export default Game;