import React, { useEffect, useState, useContext } from "react";
import FirebaseContext from "../Context/Firebase/FirebaseContext";
import firebase from "firebase/app";
import Heart from "../icons/heart.svg";
import Upload from "../icons/upload.svg";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import Loader from "./Loader";
const Saved = (props) => {
  const { user, updateProfile } = useContext(FirebaseContext);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    let x = [];
    let y = [];
    setLoading(true);

    firebase
      .firestore()
      .collection("users")
      .doc(user.email)
      .get()
      .then((data) => {
        if (data.data().bookmarks) {
          data.data().bookmarks.forEach((post) => {
            x.push(post);
          });
          if (x.length) {
            firebase
              .firestore()
              .collection("posts")
              .where("id", "in", x)
              .get()
              .then((data) => {
                data.docs.forEach((d) => {
                  y.push(d.data());
                });
                setPosts(y);
              });
          }
        } else {
          setPosts(y);
        }

        setLoading(false);
      });
  }, []);
  return (
    <div>
      {loading ? (
        <Spin className="spin_loader" />
      ) : posts.length ? (
        <div className="grid_posts">
          {posts.map((post) => (
            <Link to={`/posts/${post.id}`}>
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
            </Link>
          ))}
        </div>
      ) : (
        <img src={Upload} className="no_post" />
      )}
    </div>
  );
};

export default Saved;
