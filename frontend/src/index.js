import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import {Authentication} from './Authentication';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import {signInWithPopup,signInWithRedirect,signInWithEmailLink} from 'firebase/auth'
import {SnackbarProvider} from  'notistack';
import {getFirestore} from 'firebase/firestore';
import {getMessaging,getToken,onMessage} from 'firebase/messaging';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACFoKjyE8um1JkecpiVpbM9A19APoVqF0",
  authDomain: "chessilcj.firebaseapp.com",
  projectId: "chessilcj",
  storageBucket: "chessilcj.appspot.com",
  messagingSenderId: "713986025716",
  appId: "1:713986025716:web:bb92432a790de7cf64d6a1",
  measurementId: "G-HNRRTYXFRY"
  }

// Initialize Firebase
const app  = initializeApp(firebaseConfig);

const messaging = getMessaging(app);


function requestPermission()
{
  console.log("Requesting permission...");
  window.Notification.requestPermission().then((permission)=>
  {
    if(permission === 'granted')
    {
      console.log("Notification permission granted.")
    }
  })
  .catch((error)=>
  {
    console.log("An error occurred while requesting permission. ",error)
  })
}

getToken(messaging,{vapidKey:"BNuYufbWK1bTXYUCT4PjphWaurSMD7T70-J5NvXZWmsfpAusCtRCLYryWP3pUIunwq9t3YXMqrNFL15oF7t-d0E"})
.then((currentToken)=>
{
  if(currentToken)
  {
    console.log("Token: ",currentToken)
  }
  else
  {
    requestPermission()
  }
})
.catch((err)=>
{
  console.log("An error occurred while retrieving token. ",err);
  requestPermission()
})

export const db = getFirestore(app)
/*
const auth = getAuth();

const provider = new GoogleAuthProvider();

provider.setCustomParameters({prompt:"select_account"})

export const signInWithGoogle = async () => await signInWithPopup(auth,provider);
*/
const router = createBrowserRouter([
  {
    path:'/',
    element:<Authentication/>
  },
  {
    path:'/game',
    element:<App/>
  }]
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <SnackbarProvider maxSnack={3}>
      <RouterProvider router = {router}/>
    </SnackbarProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
