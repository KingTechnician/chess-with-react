import { useState, useMemo, useCallback, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import CustomDialog from "./components/CustomDialog";
import{onAuthStateChanged,getAuth} from 'firebase/auth';
import{useSearchParams} from 'react-router-dom';
import {useSnackbar} from 'notistack';
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
  
  const [apiPath,setApiPath] = useState("http://127.0.0.1.:5000")
  const [searchParams,setSearchParams] = useSearchParams();
  const {enqueueSnackbar} = useSnackbar();
  const [currentGame, setCurrentGame] = useState({});
  const showSnackbar = (message,variant)=>
  {
    enqueueSnackbar(message,{variant:variant})
  }
  useEffect(()=>
  {
    
    var chessToMake = undefined
    onAuthStateChanged(getAuth(),async (user)=>
    {
      const gameId = searchParams.get("id");
      console.log(gameId)
      const idToken = await user.getIdToken();
      fetch(apiPath+"/specificgame",
      {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({idToken:idToken,game_id:gameId})
      })
      .then((response)=>response.json())
      .then((data)=>
      {
        console.log(data)
        //Get last move from turns
        //Set fen to last move
        if(data!==undefined && data.turns!==undefined)
        {
        var lastTurn = data.turns[data.turns.length-1]
        console.log(lastTurn)
        setCurrentGame(data)
        chessToMake = new Chess(lastTurn)
        }
      })
      .catch((error)=>
      {
        return new Chess()
      })
    })
    console.log(chessToMake)
  },[])
  const [chess,setChess] = useState(new Chess()); // <- 1
  useEffect(()=>
  {
    console.log(currentGame)
    if(Object.keys(currentGame).length === 0)
    {
      console.log("Not loading yet")
    }
    else
    {
      var lastTurn = currentGame.turns[currentGame.turns.length-1]
      setFen(lastTurn)
      setChess(new Chess(lastTurn))
    }
  },[currentGame])
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
    console.log(moveData)
    if (move===null) return false;
    else
    {
      onAuthStateChanged(getAuth(),async(user)=>
      {
        const idToken = await user.getIdToken();
        const gameId = searchParams.get("id");
        const currentBoard = chess.fen();
        console.log(currentBoard)
        fetch(apiPath+"/move",
        {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({idToken:idToken,game_id:gameId,currentBoard:currentBoard})
        })
        .then((response)=>response.json())
        .then((data)=>{showSnackbar("Move stored.")})
        .catch((error)=>showSnackbar("Either there is an error or the backend has not been set up yet.","error"))
      })
    }

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