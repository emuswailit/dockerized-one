import React from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import history from "./history";
import Login from "../components/Login";
import Home from "../components/Home";
import Users from "../components/Users/Users";

// A wrapper for <Route> that redirects to the login screen if you're not yet authenticated.
function PrivateRoute({ isAuthenticated, children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login/",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

function Urls(props) {
  return (
    <div>
      <Router history={history}>
        <Switch>
          <Route exact path="/login/">
            {" "}
            <Login {...props} />
          </Route>

          <PrivateRoute
            exact
            path="/users/"
            isAuthenticated={props.auth.isAuthenticated}
          >
            <Users {...props} />
          </PrivateRoute>
          <PrivateRoute
            exact
            path="/"
            isAuthenticated={props.auth.isAuthenticated}
          >
            <Home {...props} />
          </PrivateRoute>
        </Switch>
      </Router>
    </div>
  );
}

export default Urls;
