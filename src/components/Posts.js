import React, { useEffect, useState, useContext } from "react";
import FirebaseContext from "../Context/Firebase/FirebaseContext";
import firebase from "firebase/app";
import Heart from "../icons/heart.svg";
import Upload from "../icons/upload.svg";
import { Link } from "react-router-dom";
const Posts = (props) => {
  const { user, updateProfile } = useContext(FirebaseContext);
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    if (props.userName) {
      let x = [];
      firebase
        .firestore()
        .collection("users")
        .where("userName", "==", props.userName)
        .get()
        .then((u) => {
          firebase
            .firestore()
            .collection("posts")
            .where("email", "==", u.docs[0].data().email)
            .get()
            .then((data) => {
              data.docs.forEach((post) => {
                x.push(post.data());
              });
              setPosts(x);
            });
        });
    }
  }, [props.userName]);
  return (
    <div>
      {posts.length ? (
        <div className="grid_posts">
          {posts.map((post) => (
            <a href={`posts/${post.id}`}>
              <div className="image_1">
                <img src={post.url} className="image_post" />
                <div className="middle1">
                  <div className="text1">
                    {!post.likes ? (
                      <span>
                        0 <i class="fa fa-heart-o" aria-hidden="true"></i>
                      </span>
                    ) : (
                      <span>
                        {post.likes.length}{" "}
                        <i class="fa fa-heart-o" aria-hidden="true"></i>
                      </span>
                    )}
                    &nbsp;&nbsp;
                    {!post.comments ? (
                      <span>
                        0 <i class="fa fa-comment-o" aria-hidden="true"></i>
                      </span>
                    ) : (
                      <span>
                        {post.comments.length}{" "}
                        <i class="fa fa-comment-o" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <img src={Upload} className="no_post" />
      )}
    </div>
  );
};

export default Posts;
