import React, { useEffect, useState, useContext, useRef } from "react";
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
  const [heart, setHeart] = useState(false);
  const myRef = useRef(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [latestComments, setLatest] = useState([]);

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

  const compare = (a, b) => {
    return a.time < b.time;
  };

  useEffect(() => {
    firebase
      .firestore()
      .doc(`/posts/${postId}`)
      .onSnapshot((data) => {
        if (!data.exists) {
          props.history.push("/");
        } else {
          if (data.data().comments) {
            data.data().comments.sort(compare);
          }

          if (data.data().comments) {
            let newComments = [];
            data.data().comments.forEach((d) => {
              firebase
                .firestore()
                .doc(`/users/${d.email}`)
                .get()
                .then((u) => {
                  d.userName = u.data().userName;
                  d.photoURL = u.data().photoURL;
                  newComments.push(d);
                });
            });
            let count = 0;
            var newArr = [];

            for (let i = data.data().comments.length - 1; i >= 0; i--) {
              if (count == 2) break;
              firebase
                .firestore()
                .doc(`/users/${data.data().comments[i].email}`)
                .get()
                .then((u) => {
                  let temp = {};
                  temp.comment = data.data().comments[i].comment;
                  temp.time = data.data().comments[i].comment;

                  temp.userName = u.data().userName;
                  temp.photoURL = u.data().photoURL;

                  newArr.push(temp);
                });
              count += 1;
            }
            setLatest(newArr);
            setComments(newComments);
          }
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

  const handleDBClick = () => {
    setHeart(true);
    setTimeout(() => {
      setHeart(false);
    }, 800);
    if (post.likes) {
      if (!post.likes.includes(user.email)) {
        post.likes.push(user.email);
        firebase
          .firestore()
          .doc(`/posts/${post.id}`)
          .update({
            likes: post.likes,
          })
          .then(() => {});
      }
    } else {
      let likes = [];
      likes.push(user.email);
      firebase
        .firestore()
        .doc(`/posts/${post.id}`)
        .update({
          likes,
        })
        .then(() => {});
    }
  };

  const handleLike = () => {
    if (post.likes) {
      if (!post.likes.includes(user.email)) {
        post.likes.push(user.email);
        firebase
          .firestore()
          .doc(`/posts/${post.id}`)
          .update({
            likes: post.likes,
          })
          .then(() => {});
      } else {
        let likes = post.likes;
        likes = likes.filter((like) => like !== user.email);
        firebase
          .firestore()
          .doc(`/posts/${post.id}`)
          .update({
            likes,
          })
          .then(() => {});
      }
    } else {
      let likes = [];
      likes.push(user.email);
      firebase
        .firestore()
        .doc(`/posts/${post.id}`)
        .update({
          likes,
        })
        .then(() => {});
    }
  };

  const handleBookmark = () => {
    console.log(user);
    if (user.bookmarks) {
      if (!user.bookmarks.includes(post.id)) {
        let bookmarks = user.bookmarks;
        bookmarks.push(post.id);
        firebase
          .firestore()
          .doc(`/users/${user.email}`)
          .update({
            bookmarks,
          })
          .then(() => {});
      } else {
        let bookmarks = user.bookmarks;
        bookmarks = bookmarks.filter((like) => like !== post.id);
        firebase
          .firestore()
          .doc(`/users/${user.email}`)
          .update({
            bookmarks,
          })
          .then(() => {});
      }
    } else {
      let bookmarks = [];
      bookmarks.push(post.id);
      firebase
        .firestore()
        .doc(`/users/${user.email}`)
        .update({
          bookmarks,
        })
        .then(() => {});
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (comment.length) {
      let newComment = {};
      newComment.time = Date.now();
      newComment.comment = comment;
      newComment.email = user.email;
      if (post.comments) {
        let comments = post.comments;
        comments.push(newComment);
        firebase
          .firestore()
          .doc(`/posts/${post.id}`)
          .update({ comments })
          .then(() => {});
      } else {
        let comments = [];
        comments.push(newComment);
        firebase
          .firestore()
          .doc(`/posts/${post.id}`)
          .update({ comments })
          .then(() => {});
      }
    }
    if (myRef && myRef.current)
      myRef.current.scrollIntoView({ behavior: "smooth" });
    setComment("");
  };

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
                    style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}
                    className="delete_post"
                  />
                </Popconfirm>
              )}
            </div>
            <div className="inner_div1">
              <img
                src={post.url}
                className="post_image"
                onDoubleClick={handleDBClick}
              />
              {heart && <i className="fa fa-heart" aria-hidden="true" />}
            </div>
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
          <div className="comments_grid">
            <div className="grid_c_div">
              {comments.length ? (
                <>
                  {comments.map((c) => (
                    <div className="comment_grid">
                      <img src={c.photoURL} className="comment_img" />
                      <div>
                        {" "}
                        <span className="post_userName">
                          <a href={`/${c.username}`} style={{ color: "black" }}>
                            {c.userName}
                          </a>
                        </span>
                        <span>{c.comment}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={myRef}></div>
                </>
              ) : null}
            </div>
          </div>
          {comments.length && (
            <div className="mobile_comments">
              <span className="view_comments">
                View all {comments.length} comments
              </span>
              {latestComments.length
                ? latestComments.map((com) => (
                    <div>
                      <span className="post_userName">
                        <a href={`/${com.username}`} style={{ color: "black" }}>
                          {com.userName}
                        </a>
                      </span>
                      &nbsp;
                      {com.comment}
                    </div>
                  ))
                : null}
            </div>
          )}

          <div className="compo_grid">
            <div className="heart_grid">
              <div>
                <i
                  class={`${
                    !post.likes
                      ? `fa fa-heart-o`
                      : post.likes.includes(user.email)
                      ? `fa fa-heart`
                      : `fa fa-heart-o`
                  }`}
                  aria-hidden="true"
                  onClick={handleLike}
                />
                <i class="fa fa-comment-o" aria-hidden="true"></i>
                <i class="fa fa-share" aria-hidden="true"></i>
              </div>
              <i
                className={`${
                  !user.bookmarks
                    ? `fa fa-bookmark-o bookmark`
                    : user.bookmarks.includes(post.id)
                    ? `fa fa-bookmark bookmark`
                    : `fa fa-bookmark-o bookmark`
                }`}
                aria-hidden="true"
                onClick={handleBookmark}
                style={{ marginRight: "0.5rem" }}
              ></i>
            </div>
            <div className="separate">
              {post.likes ? (
                <span className="likes_div">{post.likes.length} likes</span>
              ) : (
                <span className="likes_div">0 likes</span>
              )}
            </div>
            <div className="text_input_post">
              <form onSubmit={handleComment}>
                <input
                  type="text"
                  placeholder="Add a comment"
                  onChange={(e) => setComment(e.target.value)}
                  value={comment}
                />
                <button className="post_comment" onClick={handleComment}>
                  Post
                </button>
              </form>
            </div>
          </div>
          <div className="hidden_input">
            <div className="text_input_post1">
              <form onSubmit={handleComment}>
                <input
                  type="text"
                  placeholder="Add a comment"
                  onChange={(e) => setComment(e.target.value)}
                  value={comment}
                />
                <button className="post_comment" type="submit">
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
