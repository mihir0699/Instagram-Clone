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
import Post from "./components/Post";
import Explore from "./components/Explore";

const DefaultContainer = () => (
  <div>
    <div className="container">
      <Header />
      <PrivateRoute exact path="/posts/:postId" component={Post} />
      <PrivateRoute exact path="/explore/posts" component={Explore} />
      <PrivateRoute exact path="/:userName" component={Profile} />
    </div>
  </div>
);
function App() {
  return (
    <div className="App">
      <ToastProvider>
        <FireState>
          <Router>
            <Switch>
              <Route exact path="/signup" component={Signup} />
              <Route exact path="/" component={Login} />
              <PrivateRoute component={DefaultContainer} />
            </Switch>
          </Router>
        </FireState>
      </ToastProvider>
    </div>
  );
}

export default App;
