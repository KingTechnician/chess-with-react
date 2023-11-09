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
import List from '@mui/material/List'
import {createTheme, ThemeProvider, styled} from '@mui/material/styles'

import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import{useGoogleOneTapLogin} from 'react-google-one-tap-login'


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
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary="Inbox" />
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
      <MainDrawer open={open} setOpen={setOpen}/>
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
