import React, { useEffect, useState, useContext } from "react";
import FirebaseContext from "../Context/Firebase/FirebaseContext";
import firebase from "firebase/app";
import FeedPost from "./FeedPost";
import Loader from "./Loader";
import UserImage from "../images/user.svg";
import Social from "../images/social.svg";
import { Link } from "react-router-dom";
const Home = () => {
  const { user, updateProfile } = useContext(FirebaseContext);
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(null);

  const func = (a, b) => {
    return 0.5 - Math.random();
  };
  const handleFollow1 = (userEmail) => {
    let following = user.following;
    if (!following) {
      following = [];
    }
    following.push(userEmail);
    firebase
      .firestore()
      .doc(`/users/${user.email}`)
      .update({
        following: following,
      })
      .then(() => {
        firebase
          .firestore()
          .collection("users")
          .doc(userEmail)
          .get()
          .then((data) => {
            let followers = data.data().followers;
            if (!followers) followers = [];
            followers.push(user.email);
            firebase.firestore().collection("users").doc(userEmail).update({
              followers: followers,
            });
          });
      });
  };
  const handleUnFollow1 = (userEmail) => {
    let following = user.following;
    following = following.filter((user1) => {
      return !(user1 == userEmail);
    });
    firebase
      .firestore()
      .doc(`/users/${user.email}`)
      .update({
        following: following,
      })
      .then(() => {
        firebase
          .firestore()
          .collection("users")
          .doc(userEmail)
          .get()
          .then((data) => {
            let followers = data.data().followers;
            followers = followers.filter((user2) => {
              return !(user2 == user.email);
            });
            firebase.firestore().doc(`/users/${userEmail}`).update({
              followers: followers,
            });
          });
      });
  };
  useEffect(() => {
    if (user) {
      if (user?.following?.length) {
        firebase
          .firestore()
          .collection("posts")
          .where("email", "in", [...user.following, user.email])
          .limit(10)
          .get()
          .then((data) => {
            if (data.docs.length) {
              let x = [];
              data.docs.forEach((post) => {
                x.push(post.data().id);
              });
              setPosts(x);
              setLoading(false);
            }
          });
      }

      if (user?.following?.length > 0) {
        firebase
          .firestore()
          .collection("users")
          .where("email", "not-in", user.following)
          .get()
          .then((data) => {
            if (data.docs) {
              let x = [];
              data.docs.forEach((u) => {
                if (
                  u.data().email !== user.email &&
                  u.data().email != "mihir0699@gmail.com"
                )
                  x.push(u.data());
              });
              x.sort(func);
              if (!user?.following?.includes("mihir0699@gmail.com")) {
                firebase
                  .firestore()
                  .doc(`/users/mihir0699@gmail.com`)
                  .get()
                  .then((data) => {
                    x.unshift(data.data());
                    x.sort(func);
                    let z = x.slice(0, 4);

                    setUsers(z);
                  });
              } else {
                let z = x.slice(0, 4);
                setUsers(z);
              }
            }
          });
      } else {
        firebase
          .firestore()
          .collection("users")
          .get()
          .then((data) => {
            if (data.docs) {
              let x = [];
              data.docs.forEach((u) => {
                if (
                  u.data().email != user.email &&
                  u.data().email != "mihir0699@gmail.com"
                )
                  x.push(u.data());
              });
              if (!user?.following?.includes("mihir0699@gmail.com")) {
                firebase
                  .firestore()
                  .doc(`/users/mihir0699@gmail.com`)
                  .get()
                  .then((data) => {
                    x.unshift(data.data());
                    x.sort(func);
                    let z = x.slice(0, 4);
                    setUsers(z);
                  });
              }
              x.sort(func);
              let z = x.slice(0, 4);
              setUsers(z);
            }
          });
      }
    }

    setLoading(false);
  }, []);
  return (
    <div>
      {loading || !users ? (
        <Loader />
      ) : posts ? (
        <div className="home_grid">
          <div>
            {posts.map((post) => (
              <FeedPost id={post} />
            ))}
          </div>
          <div className="sidebar">
            <div className="fixed_div">
              {user.photoURL ? (
                <img src={user.photoURL} className="user_home" />
              ) : (
                <img src={UserImage} className="user_home" />
              )}
              <div className="serach_flex">
                <Link to={`/${user.userName}`}>
                  <span className="userName_search">{user.userName}</span>
                </Link>
                <span className="name_search">{user.name}</span>
              </div>
            </div>
            {users?.length ? (
              <div className="suggestions_div">
                <h3>Suggestions for you</h3>
                <div>
                  {users.map((u) => (
                    <div className="suggest_div">
                      {" "}
                      {u.photoURL ? (
                        <img src={u.photoURL} className="user_home" />
                      ) : (
                        <img src={UserImage} className="user_home" />
                      )}
                      <div className="serach_flex">
                        <Link to={`/${u.userName}`}>
                          <span className="userName_search">{u.userName}</span>
                        </Link>
                        <span className="name_search">{u.name}</span>
                      </div>
                      {user?.following.includes(u.email) ? (
                        <button
                          className="un_home"
                          onClick={() => handleUnFollow1(u.email)}
                        >
                          Unfollow
                        </button>
                      ) : (
                        <button
                          className="follow_home"
                          onClick={() => handleFollow1(u.email)}
                        >
                          {" "}
                          Follow
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="home_flex">
          <div className="sidebar1">
            <div className="fixed_div1">
              {user.photoURL ? (
                <img src={user.photoURL} className="user_home" />
              ) : (
                <img src={UserImage} className="user_home" />
              )}
              <div className="serach_flex">
                <Link to={`/${user.userName}`}>
                  <span className="userName_search">{user.userName}</span>
                </Link>
                <span className="name_search">{user.name}</span>
              </div>
            </div>
            <div className="suggestions_div1">
              <h3>Suggestions for you</h3>
              <div>
                {users.map((u) => (
                  <div className="suggest_div">
                    {" "}
                    {u.photoURL ? (
                      <img src={u.photoURL} className="user_home" />
                    ) : (
                      <img src={UserImage} className="user_home" />
                    )}
                    <div className="serach_flex">
                      <Link to={`/${u.userName}`}>
                        <span className="userName_search">{u.userName}</span>
                      </Link>
                      <span className="name_search">{u.name}</span>
                    </div>
                    {user?.following?.includes(u.email) ? (
                      <button
                        className="un_home"
                        onClick={() => handleUnFollow1(u.email)}
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        className="follow_home"
                        onClick={() => handleFollow1(u.email)}
                      >
                        {" "}
                        Follow
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <img src={Social} className="social_image" />
          </div>
        </div>
      )}
      ;
    </div>
  );
};

export default Home;
