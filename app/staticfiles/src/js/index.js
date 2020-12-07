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
import { Button } from "@material-ui/core";
import store from "../components/store";
import Header from "../components/common/Header";
import { loadUser } from "../actions/auth";
import GenericSnackBar from "../components/common/GenericSnackBar";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import blueGrey from "@material-ui/core/colors/blueGrey";
import lightGreen from "@material-ui/core/colors/lightGreen";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      themeType: "dark",
    };
  }

  changeTheme() {
    if (this.state.themeType == "dark") {
      this.setState({ themeType: "light" });
    } else {
      this.setState({ themeType: "dark" });
    }
  }
  componentDidMount() {
    store.dispatch(loadUser());
  }
  render() {
    let theme = createMuiTheme({
      palette: {
        primary: {
          light: lightGreen[300],
          main: lightGreen[500],
          dark: lightGreen[700],
        },
        secondary: {
          light: blueGrey[300],
          main: blueGrey[500],
          dark: blueGrey[700],
        },
        type: this.state.themeType,
      },
    });
    return (
      <Provider store={store}>
        <GenericSnackBar />
        <Router>
          <MuiThemeProvider theme={theme}>
            <Fragment>
              <Header />
              <Button
                title="Change Themes"
                variant="contained"
                color="secondary"
                onClick={() => {
                  this.changeTheme();
                }}
              >
                Change Theme
              </Button>
            </Fragment>
          </MuiThemeProvider>
        </Router>
      </Provider>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("react-app"));
