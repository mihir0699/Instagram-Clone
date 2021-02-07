import FirebaseContext from "../Context/Firebase/FirebaseContext";
import React, { useContext, useState, useEffect } from "react";
import { Link, useParams, Redirect } from "react-router-dom";
import UserImage from "../images/user.svg";
import firebase from "firebase/app";
import { Button, Modal, Form, Input, Upload, Tabs } from "antd";
import Loader from "./Loader";
import Posts from "./Posts";
import PostImage from "../icons/posts.png";
import Bookmark from "../icons/bookmark.svg";
import { ToastProvider, useToasts } from "react-toast-notifications";
import {
  UploadOutlined,
  AppleOutlined,
  AndroidOutlined,
} from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import "antd/es/modal/style";
import "antd/es/slider/style";
import Saved from "./Saved";
import Post from "./Post";
const Profile = (props) => {
  const [contextUser, setContextUser] = useState(null);
  const { addToast } = useToasts();
  const [follow, setFollow] = useState(null);
  const { user, updateProfile, update } = useContext(FirebaseContext);
  let { userName } = useParams();
  const [file, setFile] = useState(null);
  const { TabPane } = Tabs;
  const [User, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const normFile = (e) => {
    setFile(e.target.files[0]);
    var reader = new FileReader();
    var url = reader.readAsDataURL(e.target.files[0]);
    reader.onloadend = (e) => {
      let imgSrc = [reader.result];
      setPreview(imgSrc);
    };
  };
  const [loading, setLoading] = useState(true);
  const [validation, setValidation] = useState({});

  useEffect(() => {
    firebase
      .firestore()
      .collection("users")
      .where("userName", "==", userName)
      .onSnapshot((snap) => {
        if (!snap.docs.length) props.history.push("/");
        else {
          setUser(snap.docs[0].data());
          if (
            user.following &&
            user.following.includes(snap.docs[0].data().email)
          ) {
            setFollow(true);
          } else setFollow(false);
          setLoading(false);
        }
      });
  }, []);

  const [follwers_show, setFollowers_show] = useState(null);
  const [follwing_show, setFollowing_show] = useState(null);
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);

  const showModal1 = async () => {
    if (User?.followers?.length <= 10) {
      firebase
        .firestore()
        .collection("users")
        .where("email", "in", User.followers)
        .get()
        .then((data) => {
          let x = data.docs;
          x = x.map((data) => {
            let obj = {};
            const { name, email, userName, photoURL } = data.data();
            obj.email = email;
            obj.name = name;
            obj.userName = userName;
            obj.photoURL = photoURL;
            return obj;
          });
          setFollowers_show(x);
          setIsModalVisible1(true);
        });
    } else {
      let resolve = [];
      User.followers.forEach((u) => {
        resolve.push(
          firebase
            .firestore()
            .collection("users")
            .doc(u)
            .get()
            .then((data) => {
              let obj = {};
              const { name, email, userName, photoURL } = data.data();
              obj.email = email;
              obj.name = name;
              obj.userName = userName;
              obj.photoURL = photoURL;
              return obj;
            })
        );
      });
      let res = await Promise.all(resolve);
      setFollowers_show(res);
      setIsModalVisible1(true);
    }
  };
  const showModal2 = async () => {
    if (User?.following?.length <= 10) {
      firebase
        .firestore()
        .collection("users")
        .where("email", "in", User.following)
        .get()
        .then((data) => {
          let x = data.docs;
          x = x.map((data) => {
            let obj = {};
            const { name, email, userName, photoURL } = data.data();
            obj.email = email;
            obj.name = name;
            obj.userName = userName;
            obj.photoURL = photoURL;
            return obj;
          });
          setFollowing_show(x);
          setIsModalVisible2(true);
        });
    } else {
      let resolve = [];
      User.following.forEach((u) => {
        resolve.push(
          firebase
            .firestore()
            .collection("users")
            .doc(u)
            .get()
            .then((data) => {
              let obj = {};
              const { name, email, userName, photoURL } = data.data();
              obj.email = email;
              obj.name = name;
              obj.userName = userName;
              obj.photoURL = photoURL;
              return obj;
            })
        );
      });
      let res = await Promise.all(resolve);
      setFollowing_show(res);
      setIsModalVisible2(true);
    }
  };
  const handleOk2 = () => {
    setIsModalVisible2(false);
  };

  const handleCancel2 = () => {
    setIsModalVisible2(false);
  };

  const handleOk1 = () => {
    setIsModalVisible1(false);
  };

  const handleCancel1 = () => {
    setIsModalVisible1(false);
  };

  const [visible, setVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const handleUserName = (e) => {
    setValidation({ ...validation, status: "validaing" });
    firebase
      .firestore()
      .collection("users")
      .where("userName", "==", e.target.value)
      .limit(1)
      .get()
      .then((data) => {
        if (data.docs.length && data.docs[0].data().userName != user.userName) {
          setValidation({
            ...validation,
            status1: "error",
            help1: "This username already exists",
          });
        } else if (e.target.value === "") {
          setValidation({
            ...validation,
            status1: "error",
            help1: "Please input your username!",
          });
        } else {
          setValidation({ ...validation, status1: "success", help1: "" });
        }
      });
  };
  const [postsLen, setLen] = useState(0);
  useEffect(() => {
    setContextUser(user);
    if (User) {
      if (user.following && user.following.includes(User.email))
        setFollow(true);
      else setFollow(false);
      firebase
        .firestore()
        .collection("posts")
        .where("email", "==", User.email)
        .get()
        .then((data) => {
          setLen(data.docs.length);
        });
    }
  }, [user, User]);

  const [form] = Form.useForm();
  const [formLayout, setFormLayout] = useState("horizontal");
  const handleFinish = async (values) => {
    if (!validation?.help1?.length) {
      values.file = file;
      updateProfile(values);
      setVisible(false);
    }
  };
  const onFormLayoutChange = ({ layout }) => {
    setFormLayout(layout);
  };

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };
  const handleFollow = () => {
    let following = user.following;
    if (!following) {
      following = [];
    }
    following.push(User.email);
    firebase
      .firestore()
      .doc(`/users/${contextUser.email}`)
      .update({
        following: following,
      })
      .then(() => {
        let followers = User.followers;
        if (!followers) followers = [];
        followers.push(contextUser.email);
        firebase.firestore().doc(`/users/${User.email}`).update({
          followers: followers,
        });
      });
  };

  const handleFollow1 = (userEmail) => {
    let following = user.following;
    if (!following) {
      following = [];
    }
    following.push(userEmail);
    firebase
      .firestore()
      .doc(`/users/${contextUser.email}`)
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
            followers.push(contextUser.email);
            firebase.firestore().collection("users").doc(userEmail).update({
              followers: followers,
            });
          });
      });
  };

  const handleUnFollow = () => {
    let following = user.following;
    following = following.filter((user1) => {
      return !(user1 == User.email);
    });
    firebase
      .firestore()
      .doc(`/users/${contextUser.email}`)
      .update({
        following: following,
      })
      .then(() => {
        let followers = User.followers;
        followers = followers.filter((user2) => {
          return !(user2 == contextUser.email);
        });
        firebase.firestore().doc(`/users/${User.email}`).update({
          followers: followers,
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
      .doc(`/users/${contextUser.email}`)
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
              return !(user2 == contextUser.email);
            });
            firebase.firestore().doc(`/users/${userEmail}`).update({
              followers: followers,
            });
          });
      });
  };

  const formItemLayout =
    formLayout === "horizontal"
      ? {
          labelCol: {
            span: 4,
          },
          wrapperCol: {
            span: 14,
          },
        }
      : null;
  const buttonItemLayout =
    formLayout === "horizontal"
      ? {
          wrapperCol: {
            span: 14,
            offset: 4,
          },
        }
      : null;

  return (
    <ImgCrop>
      <div>
        {User ? (
          <div>
            <Modal
              title="Followers"
              visible={isModalVisible1}
              onOk={handleOk1}
              onCancel={handleCancel1}
              footer={null}
            >
              {follwers_show
                ? follwers_show.map((follower) => (
                    <div className="modal_div">
                      {follower.photoURL ? (
                        <img src={follower.photoURL} />
                      ) : (
                        <img src={UserImage} />
                      )}
                      <div className="modal_div_grid">
                        <a
                          href={`/${follower.userName}`}
                          onClick={() => setIsModalVisible1(false)}
                        >
                          <span className="modal_div_userName">
                            {follower.userName}
                          </span>
                        </a>
                        <span className="modal_div_name">
                          {follower.userName}
                        </span>
                      </div>
                      <div>
                        {follower.email ===
                        contextUser.email ? null : contextUser.following.includes(
                            follower.email
                          ) ? (
                          <button
                            className="edit_btn"
                            onClick={() => handleUnFollow1(follower.email)}
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            className="follow_btn"
                            onClick={() => handleFollow1(follower.email)}
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                : null}
            </Modal>
            <Modal
              title="Following"
              visible={isModalVisible2}
              onOk={handleOk2}
              onCancel={handleCancel2}
              footer={null}
            >
              {follwing_show
                ? follwing_show.map((follower) => (
                    <div className="modal_div">
                      {follower.photoURL ? (
                        <img src={follower.photoURL} />
                      ) : (
                        <img src={UserImage} />
                      )}
                      <div className="modal_div_grid">
                        <a
                          href={`/${follower.userName}`}
                          onClick={() => setIsModalVisible2(false)}
                        >
                          <span className="modal_div_userName">
                            {follower.userName}
                          </span>
                        </a>
                        <span className="modal_div_name">
                          {follower.userName}
                        </span>
                      </div>
                      <div>
                        {follower.email ===
                        contextUser.email ? null : contextUser.following.includes(
                            follower.email
                          ) ? (
                          <button
                            className="edit_btn"
                            onClick={() => handleUnFollow1(follower.email)}
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            className="follow_btn"
                            onClick={() => handleFollow1(follower.email)}
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                : null}
            </Modal>
            <div className="profile_grid">
              <div className="profile_image">
                {User.photoURL ? (
                  <img src={User.photoURL} className="user_image" />
                ) : (
                  <img src={UserImage} className="user_image" />
                )}
              </div>
              <div className="flex_info">
                <span className="userName_profile">
                  {User.userName}{" "}
                  {User.admin ? (
                    <img
                      src="https://www.flaticon.com/svg/static/icons/svg/1271/1271380.svg"
                      className="verify_icons"
                    />
                  ) : null}{" "}
                </span>{" "}
                {contextUser.email == User.email ? (
                  <button className="edit_btn1" onClick={showModal}>
                    Edit Profile
                  </button>
                ) : follow ? (
                  <button className="edit_btn" onClick={handleUnFollow}>
                    Unfollow
                  </button>
                ) : (
                  <button className="follow_btn" onClick={handleFollow}>
                    Follow
                  </button>
                )}
              </div>
              <div className="info_profile">
                <div className="info_grid">
                  <div>
                    <span className="span_1">{postsLen} </span>
                    <span className="span_2">posts</span>
                  </div>

                  {!User.followers || !User.followers.length ? (
                    <div>
                      <span className="span_1">0 </span>
                      <span className="span_2">followers</span>
                    </div>
                  ) : (
                    <div onClick={showModal1} className="pointer_div">
                      <span className="span_1">{User.followers.length} </span>
                      <span className="span_2">followers</span>
                    </div>
                  )}
                  {!User.following || !User.following.length ? (
                    <div>
                      <span className="span_1">0 </span>
                      <span className="span_2">following</span>
                    </div>
                  ) : (
                    <div onClick={showModal2} className="pointer_div">
                      <span className="span_1 ">{User.following.length} </span>
                      <span className="span_2">following</span>
                    </div>
                  )}
                </div>

                <div>
                  <div>
                    <span className="user_name_style">{User.name}</span>
                  </div>
                  <div>
                    {User.bio ? (
                      <div className="bio_div">{User.bio}</div>
                    ) : null}
                  </div>
                  {User.website ? (
                    <div>
                      <a
                        href={`//${User.website}`}
                        target="_blank"
                        className="website_div"
                      >
                        {User.website}
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <Modal
              title="Edit Profile"
              visible={visible}
              confirmLoading={confirmLoading}
              okButtonProps={{ style: { display: "none" } }}
              onCancel={handleCancel}
            >
              <div className="image_div">
                {User.photoURL ? (
                  <img
                    src={preview ? preview : User.photoURL}
                    className="edit_image"
                  />
                ) : (
                  <img
                    src={preview ? preview : UserImage}
                    className="edit_image"
                  />
                )}{" "}
                <div className="edit_userName">{user.userName}</div>
                <br />
                <label for="file-upload" class="image_upload">
                  <span id="profile_btn">Choose profile photo</span>
                </label>
                <input
                  type="file"
                  id="file-upload"
                  name="avatar"
                  accept="image/*"
                  onChange={normFile}
                />
              </div>
              <Form
                {...formItemLayout}
                layout={formLayout}
                form={form}
                style={{ marginTop: "2rem" }}
                onFinish={handleFinish}
                initialValues={{
                  layout: formLayout,
                  username: User.userName,
                  email: User.email,
                  name: User.name,
                  bio: User.bio,
                  website: User.website,
                }}
                onValuesChange={onFormLayoutChange}
              >
                <Form.Item label="Email">
                  <Form.Item
                    name="email"
                    noStyle
                    rules={[
                      { required: true, message: "Username is required" },
                    ]}
                  >
                    <Input placeholder="Please input" disabled />
                  </Form.Item>
                </Form.Item>
                <Form.Item label="Username">
                  <Form.Item
                    name="username"
                    hasFeedback
                    validateStatus={validation.status1}
                    style={{ height: "30px" }}
                    help={validation.help1}
                    rules={[
                      { required: true, message: "Username is required" },
                    ]}
                  >
                    <Input
                      placeholder="Please input"
                      onChange={handleUserName}
                    />
                  </Form.Item>
                </Form.Item>
                <Form.Item label="Website">
                  <Form.Item name="website" style={{ height: "30px" }}>
                    <Input placeholder="Your website" />
                  </Form.Item>
                </Form.Item>

                <Form.Item label="Name">
                  <Form.Item
                    name="name"
                    noStyle
                    rules={[{ required: true, message: "Name is required" }]}
                  >
                    <Input placeholder="Your name" />
                  </Form.Item>
                </Form.Item>

                <Form.Item label="Bio">
                  <Form.Item name="bio" noStyle>
                    <Input.TextArea />
                  </Form.Item>
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                    style={{ margin: "auto 0" }}
                  >
                    Save
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            <Tabs defaultActiveKey="1" centered="true">
              <TabPane
                tab={
                  <span>
                    <img
                      src={PostImage}
                      className="icons"
                      style={{ height: "1.8rem" }}
                    />
                    Posts
                  </span>
                }
                key="1"
              >
                <Posts userName={userName} />
              </TabPane>
              {User.userName === user.userName && (
                <TabPane
                  tab={
                    <span>
                      <img src={Bookmark} className="icons" />
                      Saved
                    </span>
                  }
                  key="2"
                >
                  <Saved />
                </TabPane>
              )}
            </Tabs>
          </div>
        ) : (
          <Loader />
        )}
      </div>
    </ImgCrop>
  );
};

export default Profile;
