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

import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import{useGoogleOneTapLogin} from 'react-google-one-tap-login'
import{getAuth, onAuthStateChanged,getIdToken} from 'firebase/auth'
import {useEffect,useState} from 'react'
import LogoutIcon from '@mui/icons-material/Logout';
import {doc,setDoc} from 'firebase/firestore';
import {db} from './index'
import {useSnackbar} from 'notistack';


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
      <List
        sx={{
          width: '100%',
          maxWidth: 360,
          padding: 1,
        }}
      >
        <ListItem button sx={{ padding: 2 }}>
          <ListItemIcon sx={{ minWidth: 45, justifyContent: 'center' }}>
            <GamepadIcon />
          </ListItemIcon>
          <ListItemText primary="Start a New Game" />
        </ListItem>
        <ListItem button sx={{padding:2}}>
          <ListItemIcon sx={{minWidth:45,justifyContent:'center'}}>
            <LogoutIcon/>
          </ListItemIcon>
          <ListItemText  primary = "Logout"/>
        </ListItem>
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


function App()
{
  const [apiPath,setApiPath] = useState("http://127.0.0.1:5000")
  const {enqueueSnackbar} = useSnackbar();
  const showSnackbar = (message,variant) =>
  {
    enqueueSnackbar(message,{variant});
  }
  const auth = getAuth();
  const startNewGame = () =>
  {
    onAuthStateChanged(auth,async (user)=>
    {
      if(user)
      {
        var idToken = await getIdToken(user);
        fetch(apiPath+"/newgame",
        {
          method:"post",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({idToken:idToken})
        })
        .then((response)=>response.json())
        .then((data)=>{
          console.log(data)
          showSnackbar("Successful command","success")
        })
        .catch((error)=>{showSnackbar(error.message,"error")});
      }
    })
    
  }
  useEffect(()=>
  {
    startNewGame();
    onAuthStateChanged(auth,(user)=>
    {
      if(user)
      {
        const cityRef = doc(db,"users",user.uid);
        const addToDocument = async() => {await setDoc(cityRef,
          {
            email:user.email,
            name:"This is a test",
            photoURL:"This is some random phone number."
          }).then(()=>
          {
            showSnackbar("Database posting successful!","success")
          }).catch((error)=>
          {
            showSnackbar(error.message,"error")
          })
        }
      }
      else
      {
        window.location.href="/"
      }
    })
  },[startNewGame,onAuthStateChanged,auth,showSnackbar])
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
