import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_0AExkQp9KpgYMtGTdFJrOgrSrkbT46Y",
  authDomain: "game-daa28.firebaseapp.com",
  projectId: "game-daa28",
  storageBucket: "game-daa28.firebasestorage.app",
  messagingSenderId: "474411172809",
  appId: "1:474411172809:web:98be72dd14fa502a4bde18"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const submitScore = async (name, score) => {
  await addDoc(collection(db, "scores"), {
    name,
    score,
    created: Date.now()
  });
};

export const getTopScores = async () => {
  const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
};