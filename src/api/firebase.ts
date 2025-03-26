import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB_s0ZbCPxrjTENPz6iXk5ZDzUOSTk5QEg",
  authDomain: "card-game-23da0.firebaseapp.com",
  databaseURL: "https://card-game-23da0-default-rtdb.firebaseio.com/",
  projectId: "card-game-23da0",
  storageBucket: "card-game-23da0.firebasestorage.app",
  messagingSenderId: "506522139371",
  appId: "1:506522139371:web:f4f672d1ed8f2c2f399cae"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);