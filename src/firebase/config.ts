// src/firebase/config.ts
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDIMwpdgauDUHd3gxXPXL38904mmK6SRUM",
  authDomain: "confradar-762ce.firebaseapp.com",
  projectId: "confradar-762ce",
  storageBucket: "confradar-762ce.firebasestorage.app",
  messagingSenderId: "530552883525",
  appId: "1:530552883525:web:cc709e868cd49Bb637d62c",
  measurementId: "G-SK24Z55T6L"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
