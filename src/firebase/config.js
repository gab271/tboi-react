import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAtr_wJLRy-gRttkHQBLQsZYJG-cmEknfI",
  authDomain: "tboi-c3c55.firebaseapp.com",
  projectId: "tboi-c3c55",
  storageBucket: "tboi-c3c55.firebasestorage.app",
  messagingSenderId: "599894056211",
  appId: "1:599894056211:web:6c7fb204d77e88b46e0ee6",
  databaseURL: "https://tboi-c3c55-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);