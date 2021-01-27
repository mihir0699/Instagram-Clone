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
    posted: false,
    update: false,
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
      })
      .catch((e) => {
        dispatch({ type: "SET_ERROR", payload: e.message });
        setTimeout(() => {
          dispatch({ type: "REMOVE_ERROR" });
        }, 2000);
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
            let b, x;
            if (values.bio) b = values.bio;
            else b = "";
            if (values.website) x = values.website;
            else x = "";

            firebase
              .firestore()
              .collection("users")
              .doc(values.email)
              .update({
                name: values.name,
                userName: values.username,
                bio: b,
                photoURL: url,
                website: x,
              })
              .then(() => {
                dispatch({ type: "UPDATE_TRUE" });
                setTimeout(() => {
                  dispatch({ type: "UPDATE_FALSE" });
                }, 2000);
              });
          });
      });
    } else {
      let b, x;
      if (values.bio) b = values.bio;
      else b = "";
      if (values.website) x = values.website;
      else x = "";

      firebase
        .firestore()
        .collection("users")
        .doc(values.email)
        .update({
          name: values.name,
          userName: values.username,
          bio: b,
          website: x,
        })
        .then(() => {
          dispatch({ type: "UPDATE_TRUE" });
          setTimeout(() => {
            dispatch({ type: "UPDATE_FALSE" });
          }, 2000);
        });
    }
  };

  const uploadPost = (file, caption) => {
    let id = nanoid(15);
    var metadata = {
      contentType: file.type,
    };
    const filePath = `posts/${id}`;
    const fileRef = firebase.storage().ref().child(filePath);
    const uploadTask = fileRef.put(file, metadata);
    uploadTask.on("state_changed", console.log, console.error, () => {
      firebase
        .storage()
        .ref()
        .child(filePath)
        .getDownloadURL()
        .then((url) => {
          let post = {};
          post.id = id;
          post.email = state.user.email;
          post.url = url;
          if (caption) post.caption = caption;
          post.timestamp = firebase.firestore.FieldValue.serverTimestamp();
          firebase
            .firestore()
            .collection("posts")
            .doc(id)
            .set(post)
            .then(() => {
              dispatch({ type: "POSTED" });
              setTimeout(() => {
                dispatch({ type: "REMOVE_POSTED" });
              }, 2000);
            });
        });
    });
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
        uploadPost,
        posted: state.posted,
        update: state.update,
      }}
    >
      {" "}
      {props.children}{" "}
    </FirebaseContext.Provider>
  );
};

export default FireState;
