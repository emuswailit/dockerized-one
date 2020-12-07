import React, { Fragment } from "react";
import { connect } from "react-redux";
import Layout from "./Layout";
import Urls from "./Urls";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import { Button } from "@material-ui/core";
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
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Button title="Click">gfgfg</Button>
        <div>
          <Fragment>
            <Layout {...this.props}>
              <Urls {...this.props} />
            </Layout>
          </Fragment>
        </div>
      </MuiThemeProvider>
    );
  }
}
const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, null)(App);
