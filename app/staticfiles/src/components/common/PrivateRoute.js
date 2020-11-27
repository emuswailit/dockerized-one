import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

const PrivateRoute = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (auth.isLoading) {
        return <h2>Loading...</h2>;
      } else if (!auth.isAuthenticated) {
        console.log("user not authenticated!");
        return <Redirect to="/login" />;
      } else {
        console.log("Logged in..");
        return <Component {...props} />;
      }
    }}
  />
);

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoute);
