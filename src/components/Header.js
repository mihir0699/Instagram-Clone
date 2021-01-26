import React, { useContext, useState, useEffect } from "react";
import InstaImage from "../images/insta_image.png";
import Home from "../icons/home.svg";
import Plus from "../icons/plus.svg";
import Logout from "../icons/log-out.svg";
import UserImage from "../images/user.svg";
import Explore from "../icons/explore.svg";
import FirebaseContext from "../Context/Firebase/FirebaseContext";
import firebase from "firebase/app";
import { Modal, Form, Button, Upload, Input, Alert } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { NavLink, Link } from "react-router-dom";
import { ToastProvider, useToasts } from "react-toast-notifications";

const Header = () => {
  const {
    user,
    updateProfile,
    loading,
    uploadPost,
    posted,
    update,
  } = useContext(FirebaseContext);
  const { addToast } = useToasts();
  const [users, setUsers] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [v, setV] = useState(null);
  const formItemLayout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 14,
    },
  };

  useEffect(() => {
    if (update) {
      addToast("Profile updated successfully!", {
        appearance: "success",
        autoDismiss: true,
      });
    }
  }, [update]);

  const handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  const onFinish = async (data) => {
    if (!file) {
      setError(true);
      setTimeout(() => {
        setError(null);
      }, 2000);
    } else {
      uploadPost(file, data.caption);
      setIsModalVisible(false);
    }
  };
  useEffect(() => {
    if (posted) {
      addToast("Posted successfully", {
        appearance: "success",
        autoDismiss: true,
      });
    }
  }, [posted]);
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }

    return e && e.fileList;
  };
  const handleFileChange = (e) => {
    setFile(e.file.originFileObj);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const close = () => {
    setShowUsers([]);
    setV("");
  };
  const [showUsers, setShowUsers] = useState([]);
  useEffect(() => {
    firebase
      .firestore()
      .collection("users")
      .get()
      .then((data) => {
        let arr = [];
        data.docs.forEach((x) => {
          const { name, userName, photoURL } = x.data();
          let y = {};
          y.name = name;
          y.userName = userName;
          y.photoURL = photoURL;
          arr.push(y);
        });
        setUsers(arr);
      });
  }, []);

  const handleChange = (e) => {
    setV(e.target.value);
    const regex = new RegExp(e.target.value, "gi");
    let arr = [];
    if (e.target.value == "") {
      setShowUsers(arr);
    } else {
      users.forEach((item) => {
        if (item.name.match(regex) || item.userName.match(regex))
          arr.push(item);
      });
      setShowUsers(arr);
    }
  };
  return (
    <div>
      {!loading && user ? (
        <nav>
          <NavLink to={`/`}>
            <label style={{ cursor: "pointer" }}>
              <img src={InstaImage} className="logo" />
            </label>
          </NavLink>
          <div>
            <input
              type="text"
              className="input_header"
              placeholder="Search"
              onChange={handleChange}
              value={v}
            />
            <ul className="list-group">
              {showUsers.map((data) => (
                <>
                  <a href={`/${data.userName}`}>
                    <li className="list-group-item" onClick={close}>
                      {data.photoURL ? (
                        <img src={data.photoURL} className="search_img" />
                      ) : (
                        <img src={UserImage} className="search_img" />
                      )}
                      <div className="serach_flex">
                        <span className="userName_search">{data.userName}</span>
                        <span className="name_search">{data.name}</span>
                      </div>
                    </li>
                  </a>
                </>
              ))}
            </ul>
          </div>
          <ul className="header_list">
            <NavLink to={`/`} className="hide_home">
              <li>
                <img src={Home} />
              </li>
            </NavLink>
            <NavLink to={`/explore/posts`}>
              <li>
                <img src={Explore} className="display_explore" />
              </li>
            </NavLink>
            <li>
              <img
                src={Plus}
                style={{ cursor: "pointer" }}
                onClick={showModal}
              />
            </li>

            <a href={`/${user.userName}`}>
              <li>
                {user.photoURL ? (
                  <img src={user.photoURL} className="user_header" />
                ) : (
                  <img src={UserImage} className="user_header" />
                )}
              </li>
            </a>
            <li>
              <img src={Logout} onClick={handleLogout} />
            </li>
          </ul>
          <Modal
            title="Add a new post"
            visible={isModalVisible}
            okButtonProps={{ style: { display: "none" } }}
            onCancel={handleCancel}
            className="wrapper"
          >
            {error && (
              <Alert
                message="Please select a file!"
                type="error"
                showIcon
                className="alert_show"
              />
            )}

            <Form name="validate_other" {...formItemLayout} onFinish={onFinish}>
              <Form.Item
                name="upload"
                label="Upload"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  name="logo"
                  listType="picture"
                  maxCount={1}
                  onChange={handleFileChange}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
              <Form.Item label="Caption">
                <Form.Item name="caption" noStyle>
                  <Input.TextArea />
                </Form.Item>
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="middle"
                className="margin_upload"
              >
                Upload Post
              </Button>
            </Form>
          </Modal>
        </nav>
      ) : null}
    </div>
  );
};

export default Header;
