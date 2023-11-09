import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import {Login} from './Login';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import {signInWithPopup} from 'firebase/auth'
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
};

// Initialize Firebase
initializeApp(firebaseConfig);

const auth = getAuth();

const provider = new GoogleAuthProvider();

provider.setCustomParameters({prompt:"select_account"})

export const signInWithGoogle = () => signInWithPopup(auth,provider);

const router = createBrowserRouter([
  {
    path:'/',
    element:<Login/>
  },
  {
    path:'/game',
    element:<App/>
  }]
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router = {router}/>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
