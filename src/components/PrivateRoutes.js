import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import FirebaseContext from "../Context/Firebase/FirebaseContext";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { user, loading } = useContext(FirebaseContext);

  return (
    <Route
      {...rest}
      render={(props) =>
        loading ? null : !user ? (
          <Redirect
            to={{
              pathname: "/login",
            }}
          />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};

export default PrivateRoute;
