import React, { Fragment } from "react";
import { connect } from "react-redux";
import Layout from "./Layout";
import Urls from "./Urls";
function App(props) {
  return (
    <div>
      <Fragment>
        <Layout {...props}>
          <Urls {...props} />
        </Layout>
      </Fragment>
    </div>
  );
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, null)(App);
