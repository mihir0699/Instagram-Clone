import React, { useContext, useReducer, useEffect } from "react";
import FirebaseContext from "./FirebaseContext";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import FireReducer from "./FireReducer";
import { nanoid } from "nanoid";

const FireState = (props) => {
  const initialState = {
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  };
  const [state, dispatch] = useReducer(FireReducer, initialState);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        dispatch({ type: "USER_LOADED", payload: null });
      } else {
        firebase
          .firestore()
          .collection("users")
          .doc(user.email)
          .onSnapshot((snap) => {
            dispatch({ type: "USER_LOADED", payload: snap.data() });
          });
      }
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (state.user) {
      firebase
        .firestore()
        .collection("users")
        .doc(state.user.email)
        .onSnapshot((snap) => {
          dispatch({ type: "USER_LOADED", payload: snap.data() });
        });
    }
  }, []);

  const signup = async (values) => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(values.email, values.password)
      .then(async (resp) => {
        const docRef = firebase.firestore().doc(`/users/${values.email}`);
        let user = {};
        user.name = values.name;
        user.email = values.email;
        user.photoURL = resp.user.photoURL;
        user.userName = values.userName;
        docRef.set(user);
        dispatch({ type: "SIGNUP", payload: user });
      });
  };

  const login = async (values) => {
    firebase
      .auth()
      .signInWithEmailAndPassword(values.email, values.password)
      .then(async (resp) => {
        const docRef = firebase.firestore().doc(`/users/${values.email}`);
        docRef.get().then((data) => {
          dispatch({ type: "SIGNUP", payload: data.data() });
        });
      })
      .catch((e) => {
        console.log(e);
        dispatch({ type: "SET_ERROR", payload: e.message });
        setTimeout(() => {
          dispatch({ type: "REMOVE_ERROR" });
        }, 2000);
      });
  };

  const facebookSignup = ({ name, email, photoURL }) => {
    firebase
      .firestore()
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get()
      .then((data) => {
        if (data.docs.length) {
          let user = {};
          user.name = name;
          user.email = email;
          user.photoURL = photoURL;
          dispatch({ type: "SIGNUP", payload: data.docs[0].data() });
        } else {
          const docRef = firebase.firestore().doc(`/users/${email}`);
          let user = {};
          user.name = name;
          user.email = email;
          user.photoURL = photoURL;
          user.userName = nanoid(10);
          docRef.set(user);
          dispatch({ type: "SIGNUP", payload: user });
        }
      });
  };

  const updateProfile = async (values) => {
    if (values.file) {
      var metadata = {
        contentType: values.file.type,
      };
      const filePath = `users/${state.user.email}/profile-image`;
      const fileRef = firebase.storage().ref().child(filePath);
      const uploadTask = fileRef.put(values.file, metadata);
      uploadTask.on("state_changed", console.log, console.error, () => {
        firebase
          .storage()
          .ref()
          .child(filePath)
          .getDownloadURL()
          .then((url) => {
            console.log(values);
            firebase.firestore().collection("users").doc(values.email).update({
              name: values.name,
              userName: values.username,
              bio: values.bio,
              photoURL: url,
              website: values.website,
            });
          });
      });
    } else {
      firebase.firestore().collection("users").doc(values.email).update({
        name: values.name,
        userName: values.username,
        bio: values.bio,
        website: values.website,
      });
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        signup: signup,
        facebookSignup: facebookSignup,
        login: login,
        error: state.error,
        updateProfile,
      }}
    >
      {" "}
      {props.children}{" "}
    </FirebaseContext.Provider>
  );
};

export default FireState;
