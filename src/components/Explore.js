import React, { useEffect, useState, useContext } from "react";
import FirebaseContext from "../Context/Firebase/FirebaseContext";
import firebase from "firebase/app";
import Heart from "../icons/heart.svg";
import Upload from "../icons/upload.svg";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import Loader from "./Loader";
const Explore = (props) => {
  const { user, updateProfile } = useContext(FirebaseContext);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    let x = [];
    firebase
      .firestore()
      .collection("posts")
      .orderBy("timestamp", "desc")
      .limit(9)
      .get()
      .then((data) => {
        if (data.docs.length) {
          data.docs.forEach((post) => {
            x.push(post.data());
          });
        }
        setPosts(x);
        setLoading(false);
      });
  }, []);
  return (
    <div>
      {loading ? (
        <Loader />
      ) : posts.length ? (
        <div className="grid_posts">
          {posts.map((post) => (
            <a href={`/posts/${post.id}`}>
              <div className="image_1">
                <img src={post.url} className="image_post" loading="lazy" />
                <div className="middle1">
                  <div className="text1">
                    {!post.likes ? (
                      <span>
                        0{" "}
                        <i
                          class="fa fa-heart"
                          aria-hidden="true"
                          style={{ color: "white" }}
                        ></i>
                      </span>
                    ) : (
                      <span>
                        {post.likes.length}{" "}
                        <i
                          class="fa fa-heart"
                          aria-hidden="true"
                          style={{ color: "white" }}
                        ></i>
                      </span>
                    )}
                    &nbsp;&nbsp;
                    {!post.comments ? (
                      <span>
                        0{" "}
                        <i
                          class="fa fa-comment"
                          aria-hidden="true"
                          style={{ color: "white" }}
                        ></i>
                      </span>
                    ) : (
                      <span>
                        {post.comments.length}{" "}
                        <i
                          class="fa fa-comment"
                          aria-hidden="true"
                          style={{ color: "white" }}
                        />
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

export default Explore;
