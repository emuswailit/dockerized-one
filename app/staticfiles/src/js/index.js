import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";

import store from "../components/store";
import Header from "../components/common/Header";
import { loadUser } from "../actions/auth";
import GenericSnackBar from "../components/common/GenericSnackBar";

class App extends React.Component {
  componentDidMount() {
    store.dispatch(loadUser());
  }
  render() {
    return (
      <Provider store={store}>
        <GenericSnackBar />
        <Router>
          <Fragment>
            <Header />
          </Fragment>
        </Router>
      </Provider>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("react-app"));
