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
import { signInWithGoogle } from './index'

export function Login()
{
    //Use Material UI to create a simple login page with padding 10, TextFields for Username and password, and a Sign in With Google button.
    //Code is the following:
    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="sm" sx={{padding: 10}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h4" align="center">
                            Login
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Username" variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Password" variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                        <Button fullWidth variant="contained" color="primary" onClick= {() =>
                            {
                                //Navigate to the /game page
                                window.location.href = '/game';
                            }}>
                            Login
                        </Button>
                    </Grid>
                    <Grid item xs={12} justify="center" alignItems="center">
                        <GoogleButton onClick={signInWithGoogle}/>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    )
}