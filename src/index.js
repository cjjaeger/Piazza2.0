import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import firebase from 'firebase';
import NewPost from "./NewPost";
import IndividualPost from "./IndividualPost";
import { Router, Route, IndexRoute, hashHistory } from 'react-router';



import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
import "bootstrap/dist/css/bootstrap.css";

import './index.css';
import "react-tag-input/example/reactTags.css";

  var config = {
    apiKey: "AIzaSyBu88cPtIc1x8t-hnqakngwxlxXwdM53GM",
    authDomain: "piazza2-28fb9.firebaseapp.com",
    databaseURL: "https://piazza2-28fb9.firebaseio.com",
    storageBucket: "piazza2-28fb9.appspot.com",
    messagingSenderId: "658911789258"
  };
  firebase.initializeApp(config);

ReactDOM.render(
 <Router history={hashHistory}>
    <Route path="/" component={App} >
    {/*<IndexRoute component={Pinned} />*/}
      <Route path="newpost" component={NewPost} />
      <Route path="post" component={IndividualPost} >
        <Route path=":post" component={IndividualPost} />
      </Route>
    </Route>
  </Router>,
  document.getElementById('root')
);
