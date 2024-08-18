// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZxHhvn7SdUAmKHB78pj2zsw4zQAqHSVQ",
  authDomain: "tutty-e0d48.firebaseapp.com",
  projectId: "tutty-e0d48",
  storageBucket: "tutty-e0d48.appspot.com",
  messagingSenderId: "873373438249",
  appId: "1:873373438249:web:af3c1d12ef1742a6a1e738",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
