import React, { useState, useContext, useEffect } from "react";
import { Form, Input, Button, Checkbox } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  FacebookFilled,
} from "@ant-design/icons";
import InstaImage from "../images/insta_image.png";
import Illustation from "../images/login_illus.jpg";
import "antd/dist/antd.css";
import { auth } from "../firebase/config";
import firebase from "firebase/app";
import FirebaseContext from "../Context/Firebase/FirebaseContext";
import { ToastProvider, useToasts } from "react-toast-notifications";
import { Link } from "react-router-dom";
import Loader from "./Loader";

const Login = (props) => {
  const [form] = Form.useForm();
  const { addToast } = useToasts();
  const [loading, setLoading] = useState({});
  const {
    user,
    login,
    facebookSignup,
    error,
    loading: newLoading,
  } = useContext(FirebaseContext);

  const onFinish = async (values) => {
    if (!loading?.help2?.length && !loading?.help1?.length) await login(values);
  };
  useEffect(() => {
    if (error) addToast(error, { appearance: "error", autoDismiss: true });
  }, [error]);

  useEffect(() => {
    if (user) props.history.push(`/${user.userName}`);
  }, [user]);

  const checkEmail = (e) => {
    setLoading({ ...loading, status2: "validating" });
    firebase
      .firestore()
      .collection("users")
      .where("email", "==", e.target.value)
      .limit(1)
      .get()
      .then((data) => {
        if (!data.docs.length) {
          setLoading({
            ...loading,
            status2: "error",
            help2: "This account is not registered",
          });
        } else if (e.target.value === "") {
          setLoading({
            ...loading,
            status2: "error",
            help2: "Please input your email id!",
          });
        } else if (e.target.value) {
          setLoading({ ...loading, status2: "success", help2: "" });
        }
      });
  };

  const [password, setPassword] = useState({
    password: "",
    confirmPassword: "",
    validateStatus: "",
    help: "",
  });
  const handleClick = (e) => {
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.setCustomParameters({
      display: "popup",
    });
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;

        let email = user.email,
          name = user.displayName,
          photoURL = user.photoURL;
        facebookSignup({ email, name, photoURL });

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        // ...
      });
  };

  return (
    <div>
      {newLoading ? (
        <Loader />
      ) : (
        <div className="flex_login">
          <div>
            <img src={Illustation} alt="illustration" className="image_illus" />
          </div>

          <div className="signup_form">
            <img src={InstaImage} className="insta_image" />
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button fb_button"
              onClick={handleClick}
            >
              <FacebookFilled width="2rem" /> Login with Facebook
            </Button>

            <span className="breaker">OR</span>
            <Form
              form={form}
              name="normal_login"
              className="login-form"
              onFinish={onFinish}
              initialValues={{
                remember: true,
              }}
            >
              <Form.Item
                name="email"
                hasFeedback
                validateStatus={loading.status2}
                help={loading.help2}
                rules={[
                  {
                    required: true,
                    message: "Please input your email id!",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  type="email"
                  placeholder="Email"
                  onChange={checkEmail}
                />
              </Form.Item>

              <Form.Item
                name="password"
                allowClear
                rules={[
                  {
                    required: true,
                    message: "Please input your Password!",
                  },
                ]}
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  onChange={(e) =>
                    setPassword({ ...password, password: e.target.value })
                  }
                  placeholder="Password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  style={{ margin: "auto 0.5rem" }}
                >
                  Login
                </Button>
                Or <Link to="/signup">signup now!</Link>
              </Form.Item>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
