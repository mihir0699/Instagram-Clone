import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, Redirect } from "react-router-dom";
import firebase from "firebase/app";
import Loader from "./Loader";
import { EllipsisOutlined } from "@ant-design/icons";
import { Popconfirm } from "antd";
import FirebaseContext from "../Context/Firebase/FirebaseContext";

const Post = (props) => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [owner, setOwner] = useState(null);
  const handleConfirm = () => {
    var postRef = firebase.storage().ref().child(`/posts/${post.id}`);
    postRef
      .delete()
      .then(function () {
        firebase
          .firestore()
          .doc(`/posts/${post.id}`)
          .delete()
          .then(() => {
            props.history.push("/");
          });
      })
      .catch(function (error) {
        // Uh-oh, an error occurred!
      });
  };
  const { user, updateProfile } = useContext(FirebaseContext);
  useEffect(() => {
    firebase
      .firestore()
      .doc(`/posts/${postId}`)
      .onSnapshot((data) => {
        if (!data.exists) {
          props.history.push("/");
        } else {
          setPost(data.data());
          firebase
            .firestore()
            .doc(`/users/${data.data().email}`)
            .get()
            .then((u) => {
              setOwner(u.data());
            });
        }
      });
  }, []);

  return (
    <div>
      {!post || !owner ? (
        <Loader />
      ) : (
        <div className="post_grid">
          <div className="post_photo_grid">
            <div className="post_info_grid">
              {owner.photoURL ? (
                <img src={owner.photoURL} className="image_circle" />
              ) : null}
              <div>
                <a href={`/${owner.userName}`} style={{ color: "black" }}>
                  {owner.userName}
                </a>
              </div>
              {user.email === post.email && (
                <Popconfirm
                  placement="top"
                  title="Delete this post?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={handleConfirm}
                >
                  <EllipsisOutlined
                    style={{ fontSize: "1.5rem" }}
                    className="delete_post"
                  />
                </Popconfirm>
              )}
            </div>
            <img src={post.url} className="post_image" />
          </div>
          <div className="bio_grid">
            {owner.photoURL ? (
              <img src={owner.photoURL} className="image_circle1" />
            ) : null}
            <div>
              <a href={`/${owner.userName}`} style={{ color: "black" }}>
                {" "}
                <span className="post_userName">{owner.userName}</span>{" "}
              </a>{" "}
              {post.caption}
            </div>
          </div>
          <div className="compo_grid">
            <div className="heart_grid">
              <div>
                <i class="fa fa-heart-o" aria-hidden="true" />
                <i class="fa fa-comment-o" aria-hidden="true"></i>
                <i class="fa fa-share" aria-hidden="true"></i>
              </div>
              <i class="fa fa-bookmark-o bookmark" aria-hidden="true"></i>
            </div>
            <div className="separate">
              {post.likes ? (
                <span className="likes_div">{post.likes} likes</span>
              ) : (
                <span className="likes_div">0 likes</span>
              )}
            </div>
            <div className="text_input_post">
              <input type="text" placeholder="Add a comment" />
              <button className="post_comment">Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
