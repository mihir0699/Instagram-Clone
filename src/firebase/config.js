import firebase from "firebase/app";
import firebaseConfig from "../credentials";
import "firebase/auth";

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
