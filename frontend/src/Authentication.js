import {createTheme, ThemeProvider, styled} from '@mui/material/styles'
import {Container} from '@mui/material'
import { TextField} from '@mui/material'
import {Button} from '@mui/material'
import {Grid} from '@mui/material'
import {Typography} from '@mui/material'
import {Box} from '@mui/material'
import {theme} from './App'
import GoogleButton from 'react-google-button';
import {useGoogleOneTapLogin} from 'react-google-one-tap-login';
import {getAuth} from 'firebase/auth';
import {app} from './index';
import { GoogleAuthProvider } from 'firebase/auth'
//import { signInWithGoogle } from './index'
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signInWithPopup} from 'firebase/auth'
import React from 'react';
import {Tab} from '@mui/material';
import {TabContext,TabList,TabPanel} from '@mui/lab';
import{SnackbarProvider,useSnackbar} from 'notistack';
import {useEffect} from 'react';
import {Credentials} from './Credentials'

function createAuthorizationUrl()
{
  let scopes = ["https://www.googleapis.com/auth/datastore","https://www.googleapis.com/auth/userninfo.profile"]
  let includeGrantedScopes = true
  let responseType = "code"
  let redirectUri = "http://localhost:3000"
  let clientId = "308179806090-c19u99kj24h04oeemaqcgkfkka9khpmc.apps.googleusercontent.com"
  let scope = scopes.join("%20")
  let url = "https://accounts.google.com/o/oauth2/v2/auth?" +
            "scope=" + scope + "&" +
            "include_granted_scopes=" + includeGrantedScopes + "&" +
            "response_type=" + responseType + "&" +
            "redirect_uri=" + redirectUri + "&" +
            "client_id=" + clientId + "&" +
            "access_type=online"
  return url
  
}

function logInAndGetToken()
{
  window.open(createAuthorizationUrl(),'_blank');
}


function SignUp({email,setEmail})
{
    const {enqueueSnackbar} = useSnackbar();
    const showSnackbar = (message,variant) =>
    {
        enqueueSnackbar(message,{variant});
    }
    const [password,setPassword] = React.useState('');
    const [confirmPassword,setConfirmPassword] = React.useState('');
    return(
        <Container maxWidth="sm" sx={{padding: 10}}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h4" align="center">
                        Sign Up
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                        <TextField value={email} onChange={(i)=>{setEmail(i.target.value)}} fullWidth label="Username" variant="outlined" />
                </Grid>
                <Grid item xs={12}>
                        <TextField onChange={(e)=>{setPassword(e.target.value)}} fullWidth label="Password" variant="outlined" type="password"/>
                </Grid>
                <Grid item xs={12}>
                    <TextField onChange = {(e)=>{setConfirmPassword(e.target.value)}} fullWidth  label="Confirm password" variant ="outlined" type="password"/>
                </Grid>
                <Grid item xs={12}>
                    <Button fullWidth variant="contained" color="primary" onClick={()=>
                        {
                            if(password !==confirmPassword)
                            {
                                showSnackbar("Passwords do not match","error")
                            }
                            else if (password.length < 6)
                            {
                                showSnackbar("Password must be at least 6 characters long","error")
                            }
                            else if (email.split('@').length!==2)
                            {
                                showSnackbar("Invalid email address","error")
                            }
                            else
                            {
                                const auth = getAuth();
                                showSnackbar("Ready for registration!","success");
                                createUserWithEmailAndPassword(auth,email,password).then((user) =>
                                {
                                    console.log(user);
                                    showSnackbar("Registration successful!","success");
                                    window.location.reload();
                                }).catch((error)=>
                                {
                                    showSnackbar(error.message,"error")
                                })
                            }
                        }}>Sign Up</Button>
                </Grid>
            </Grid>
        </Container>
    )
}

function Login({email,setEmail})
{

    const {enqueueSnackbar} = useSnackbar();
    const showSnackbar = (message,variant) =>
    {
        enqueueSnackbar(message,{variant});
    }
    const [password,setPassword] = React.useState("");
    return(
        <Container maxWidth="sm" sx={{padding: 10}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h4" align="center">
                            Login
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField value={email} onChange={(i)=>{setEmail(i.target.value)}} fullWidth label="Username" variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth onChange={(i)=>{setPassword(i.target.value)}} value={password} type="password" label="Password" variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                        <Button fullWidth variant="contained" color="primary" onClick= {() =>
                            {
                                const auth = getAuth();
                                signInWithEmailAndPassword(auth,email,password).then(async(user)=>
                                {
                                    console.log(user);
                                    showSnackbar("Login successful!","success");
                                    window.location.href = "/game";
                                }).catch((error)=>
                                {
                                    showSnackbar(error.message,"error");
                                })

                            }}>
                            Login
                        </Button>
                        <GoogleButton onClick={()=>
                            {
                                const auth = getAuth();
                                const provider = new GoogleAuthProvider();
                                //Add Firebase scope
                                provider.addScope("https://www.googleapis.com/auth/datastore");
                                provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
                                //Be sure that the redirect URI is localhost:3000
                                provider.setCustomParameters({prompt:"select_account"});
                                signInWithPopup(auth,provider).then((result)=>
                                {
                                    console.log(result);
                                    showSnackbar("Login successful!","success");
                                    window.location.href = "/game";
                                })
                                .catch((error)=>
                                {
                                    showSnackbar(error.message,"error");
                                })
                            }} />
                    </Grid>
                </Grid>
            </Container>
 
    )
}


export function Authentication()
{
    const auth = getAuth();
    React.useEffect(()=>
    {
        onAuthStateChanged(auth,(user)=>
        {
            if(user)
            {
                window.location.href="/game"
            }
        })
    })
    const {enqueueSnackbar} = useSnackbar();
    const showSnackbar = (message,variant) =>
    {
        enqueueSnackbar(message,{variant});
    }
    const [email,setEmail] = React.useState('');
    const [value,setValue] = React.useState('1');
    const handleChange = (event,newValue) =>
    {
        setValue(newValue);
    }
    //Use Material UI to create a simple login page with padding 10, TextFields for Username and password, and a Sign in With Google button.
    //Code is the following:
    return (
        <ThemeProvider theme={theme}>
                <TabContext value = {value}>
                    <TabList onChange={handleChange}>
                        <Tab label="Login" value="1"/>
                        <Tab label="Sign Up" value="2"/>
                    </TabList>
                    <TabPanel value="1"><Login email={email} setEmail={setEmail}/></TabPanel>
                    <TabPanel value="2"><SignUp email={email} setEmail={setEmail}/></TabPanel>
                </TabContext>
        </ThemeProvider>
    )
}