import "./App.css";
import "./mobile.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Signup from "./components/Signup";
import FireState from "./Context/Firebase/FireState";
import { ToastProvider, useToasts } from "react-toast-notifications";
import Login from "./components/Login";
import Profile from "./components/Profile";
import PrivateRoute from "./components/PrivateRoutes";
import Header from "./components/Header";
import Explore from "./components/Explore";
import Home from "./components/Home";
import Not_Found from "./components/Not_Found";
import Footer from "./components/Footer";
import Post from "./components/Post";
require("dotenv").config();

const DefaultContainer = () => (
  <div className="container">
    <Header />
    <PrivateRoute exact path="/" component={Home} />
    <PrivateRoute exact path="/posts/:postId" component={Post} />
    <PrivateRoute exact path="/explore/posts" component={Explore} />
    <PrivateRoute exact path="/:userName" component={Profile} />
    <PrivateRoute exact path="/image/not_found" component={Not_Found} />
  </div>
);
function App() {
  return (
    <div className="App">
      <Router>
        <ToastProvider>
          <FireState>
            <Switch>
              <Route exact path="/signup" component={Signup} />
              <Route exact path="/login" component={Login} />
              <Route component={DefaultContainer} />
            </Switch>
            <Footer />
          </FireState>
        </ToastProvider>
      </Router>
    </div>
  );
}

export default App;
