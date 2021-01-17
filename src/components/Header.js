import React, { useContext, useState, useEffect } from "react";
import InstaImage from "../images/insta_image.png";
import Home from "../icons/home.svg";
import Plus from "../icons/plus.svg";
import UserImage from "../images/user.svg";
import Explore from "../icons/explore.svg";
import FirebaseContext from "../Context/Firebase/FirebaseContext";
import firebase from "firebase/app";
import { Modal, Form, Button, Upload, Input } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";

const Header = () => {
  const { user, updateProfile, loading } = useContext(FirebaseContext);
  const [users, setUsers] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [file, setFile] = useState(null);
  const formItemLayout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 14,
    },
  };

  const onFinish = (data) => {
    console.log(data);
  };
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
      {!loading ? (
        <nav>
          <label>
            <img src={InstaImage} className="logo" />
          </label>
          <div>
            <input
              type="text"
              className="input_header"
              placeholder="Search"
              onChange={handleChange}
            />
            <ul className="list-group">
              {showUsers.map((data) => (
                <>
                  <a href={data.userName}>
                    <li className="list-group-item">
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
            <li>
              <img src={Home} />
            </li>
            <li>
              <img src={Explore} />
            </li>
            <li>
              <img
                src={Plus}
                style={{ cursor: "pointer" }}
                onClick={showModal}
              />
            </li>
            <li>
              {user.photoURL ? (
                <img src={user.photoURL} className="user_header" />
              ) : (
                <img src={UserImage} className="user_header" />
              )}
            </li>
          </ul>
          <Modal
            title="Add a new post"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
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
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
              <Form.Item label="Caption">
                <Form.Item name="caption" noStyle>
                  <Input.TextArea />
                </Form.Item>
              </Form.Item>
            </Form>
          </Modal>
        </nav>
      ) : null}
    </div>
  );
};

export default Header;
