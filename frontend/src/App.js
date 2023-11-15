import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Container} from '@mui/material'
import Game from './Game'
import IconButton from '@mui/material/IconButton'
import AppBar from '@mui/material/AppBar'
import Grid from '@mui/material/Grid'
import Toolbar from '@mui/material/Toolbar'
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import InboxIcon from '@mui/icons-material/Inbox'
import GamepadIcon from '@mui/icons-material/Gamepad';
import List from '@mui/material/List'
import {createTheme, ThemeProvider, styled} from '@mui/material/styles'
import{Divider} from '@mui/material'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import{useGoogleOneTapLogin} from 'react-google-one-tap-login'
import{getAuth, onAuthStateChanged,getIdToken} from 'firebase/auth'
import {useEffect,useState} from 'react'
import LogoutIcon from '@mui/icons-material/Logout';
import {doc,setDoc} from 'firebase/firestore';
import {db} from './index'
import {useSnackbar} from 'notistack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Avatar from '@mui/material/Avatar';
import {Dialog} from '@mui/material';
import {Button} from '@mui/material';
import {Slide} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import {Select} from '@mui/material';
export const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});


export function MainDrawer(props) {
  const [name,setName] = useState("");
  const [photo,setPhoto] = useState("")
  const [dialogOpen,setDialogOpen] = useState(false);
  const [newGameOpen, setNewGameOpen] = useState(false);
  useEffect(()=>
  {
    onAuthStateChanged(getAuth(),(user)=>
    {
      if(user)
      {
        setName(user.displayName);
        setPhoto(user.photoURL);
      }
    })
  })
  return (
    <Drawer
      PaperProps={{
        sx:{
          backgroundColor:theme.palette.primary.main,
          color:theme.palette.primary.contrastText,
        }
      }}
      anchor="left"
      open={props.open}
      onClose={() => props.setOpen(false)}
      onOpen={() => props.setOpen(true)}
      sx={{ '& .MuiDrawer-paper': { width: 250, padding: 2 } }}
    >
      <Avatar alt={name} src={photo} sx={{width:100,height:100,margin:2}}/>
      <Typography variant = "h4" sx={{padding:2}}>{name}</Typography>
      <List
        sx={{
          width: '100%',
          maxWidth: 360,
          padding: 1,
        }}
      >
        <ListItem onClick = {()=>{setNewGameOpen(true)}} button sx={{ padding: 2 }}>
          <ListItemIcon sx={{ minWidth: 45, justifyContent: 'center' }}>
            <GamepadIcon />
          </ListItemIcon>
          <ListItemText primary="Start a New Game" />
        </ListItem>
        <ListItem onClick={()=>{setDialogOpen(true)}} button sx={{padding:2}}>
          <ListItemIcon sx={{minWidth:45,justifyContent:'center'}}>
            <MenuBookIcon/>
          </ListItemIcon>
          <ListItemText primary = "Current Games"/>
        </ListItem>
        <ListItem button sx={{padding:2}}>
          <ListItemIcon sx={{minWidth:45,justifyContent:'center'}}>
            <LogoutIcon/>
          </ListItemIcon>
          <ListItemText  primary = "Logout"/>
        </ListItem>
        <NewGameDialog open={newGameOpen} setOpen={setNewGameOpen}/>
        <GameViewDialog open={dialogOpen} setOpen={setDialogOpen}/>
      </List>
    </Drawer>
  );
}

export function TopAppBar()
{
  const [open,setOpen] = React.useState(false);
  return(
    <AppBar position = "static">
      <MainDrawer  open={open} setOpen={setOpen}/>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{mr:2}}
          onClick ={() =>setOpen(true)}>
          <MenuIcon/>
        </IconButton>
        <Typography variant="h6" component="div" sx={{flexGrow:1}}>
          Chess
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

function GamesDisplay(props)
{
  const games = props.games;
  console.log(games)
  if(games.length==0)
  {
    return(
      <Typography variant="h6" component="div" sx={{flexGrow:1}}>
        No games found. Create a new one above!
      </Typography>
    )
  }
  else
  {
    return(
      <List>
      {games.map((game)=>
      {
        return(
          <ListItem onClick={()=>
          {
            window.location.href = window.location.origin+`/game?id=${game.game_id}`
          }} button>
            <ListItemText
              primary="Chess game"
              secondary={`Game ID: ${game.game_id}   Difficulty: ${game.difficulty}`}
            />
          </ListItem>
        )
      })}
      </List>
    )
  }
}

function GameViewDialog(props)
{
  const [apiPath,setApiPath ] = useState("http://127.0.0.1:5000")
  const [newGameOpen , setNewGameOpen] = useState(false);
  const [currentGames,setCurrentGames] = useState([])
  const handleClickOpen = () =>{
    props.setOpen(true);
  }
  const handleClose = () =>{
    props.setOpen(false);
  }
  const handleGames = (games)=>
  {
    setCurrentGames(games)
  }

  useEffect(()=>
  {
    onAuthStateChanged(getAuth(),async (user)=>
    {
      if(user)
      {
        const idToken = await user.getIdToken();
        fetch(apiPath+"/listgames",
        {
          method:"post",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({idToken:idToken})
        }).then((response)=>response.json())
        .then((data)=>
        {
          handleGames(data.games)
        })
        .catch((error)=>console.log(error))
      }
    })
    //Pull from the Firestore database the current games
  },[setCurrentGames])
  return (
      <Dialog
        fullScreen
        open={props.open}
        onClose={handleClose}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Current Games
            </Typography>
            <Button onClick={()=>{setNewGameOpen(true)}} autoFocus color="inherit">
              Start a New Game
            </Button>
            <NewGameDialog open={newGameOpen} setOpen={setNewGameOpen}/>
          </Toolbar>
        </AppBar>
        <GamesDisplay games={currentGames}/>
      </Dialog>
  );
}

//Create component that is a modal with two dropdowns and a submit button

function NewGameDialog(props)
{
  const {enqueueSnackbar} = useSnackbar()
  const showSnackbar = (message,variant) =>
  {
    enqueueSnackbar(message,{variant});
  }
  const handleClickOpen = () =>{
    props.setOpen(true);
  }
  const handleClose = () =>{
    props.setOpen(false);
  }
  const [apiPath,setApiPath] = useState("http://127.0.0.1:5000")
  const [type,setType] = useState("");
  const [difficulty,setDifficulty] = useState("");
  const [computerChosen,setComputerChosen] = useState(false);
  const auth = getAuth();
  const startNewGame = () =>
  {
    console.log(computerChosen)
    if(type=="VS. Player")
    {
      console.log("This is not ready yet.")
      showSnackbar("Multiplayer not yet supported","warning")
    }
    else
    {
      onAuthStateChanged(auth,async (user)=>
      {
        if(user)
        {
          if(type!=="" && difficulty!=="")
          {
            var idToken = await getIdToken(user);
            fetch(apiPath+"/newaigame",
            {
              method:"post",
              headers:{"Content-Type":"application/json"},
              body:JSON.stringify({idToken:idToken,difficulty:difficulty})
            })
            .then((response)=>response.json())
            .then((data)=>{
              console.log(data)
              if(data.id!==undefined)
              {
                window.location.href = window.location.origin+`/game?id=${data.id}`
              }
              showSnackbar("Successful command","success")
            })
            .catch((error)=>{showSnackbar(error.message,"error")});
          }
          else
          {
            showSnackbar("One or more fields are empty.","warning")
          }
        }
      })
    }
    handleClose();
    
  }
  return(
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open dialog
      </Button>
      <Dialog open={props.open} onClose={handleClose}>
        <DialogTitle>Create a New Game</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DialogContentText>
                Select the type of game you want to play
              </DialogContentText>
            </Grid>
            <Grid item xs={12}>
              <Select fullWidth value={type} onChange={(i)=>
                {
                  setType(i.target.value);
                  setComputerChosen(i.target.value==="VS. CPU");
                }}>
                <MenuItem value="VS. CPU">VS. CPU</MenuItem>
                <MenuItem value="VS. Player">VS. Player</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <DialogContentText>
                Select the difficulty of the CPU
              </DialogContentText>
            </Grid>
            <Grid item xs={12}>
              <Select disabled={!computerChosen} fullWidth value={difficulty} onChange={(i)=>{setDifficulty(i.target.value)}}>
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={startNewGame}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}


function App()
{
  const [apiPath,setApiPath] = useState("http://localhost:3000")
  const {enqueueSnackbar} = useSnackbar();
  const showSnackbar = (message,variant) =>
  {
    enqueueSnackbar(message,{variant});
  }
  const auth = getAuth();
  useEffect(()=>
  {
    onAuthStateChanged(auth,(user)=>
    {
      if(user)
      {
        const cityRef = doc(db,"users",user.uid);
      }
      else
      {
        window.location.href="/"
      }
    })
  },[])
  return(
    <ThemeProvider theme={theme}>
    <TopAppBar/>
    <Container maxWidth = "md">
      <Game/>
    </Container>
    </ThemeProvider>
  )
}



export default App;
