import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from 'firebase';
import {Link, hashHistory} from 'react-router';
import {LinkContainer} from 'react-router-bootstrap';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem, Label, Button, Form, FormControl, FormGroup, Modal} from 'react-bootstrap';
import {Layout, Header, Drawer, Navigation, Content, Spinner} from 'react-mdl';
import { WithContext as ReactTags } from 'react-tag-input';

class App extends Component {
  constructor(props){
    super(props);
    //state post for what content the user would like to post
    //user shortcut to see if the user's email was verified
    //posts list all posts in this channel
    this.state = {
      'post': []
    }; 
  }

 
  render() {
    var drawerContent = <Navigation><PostList /></Navigation>
    return (
        <Layout fixedHeader fixedDrawer>
          <Header title="Class.io"  >
            <Navigation>
                <a href="">CSE 143</a>
                <a href="">Profile</a>
                <a href="">Log Out</a>
            </Navigation>
          </Header>
          <Drawer title="Class Posts" >
            {drawerContent}
        </Drawer>
        <Content>
           {this.props.children}
        </Content>
      </Layout>
    );
  }
}

class PostList extends Component {
  constructor(props){
    super(props);
    //state post for what content the user would like to post
    //user shortcut to see if the user's email was verified
    //posts list all posts in this channel
    this.state = {
        'posts': [],
        'showModal': false,
        'tags':[], 
        'universalTags': [],
        'instructorChecked': false,
        'followingChecked': false,
        'unreadChecked': false,
        'unansweredChecked': false,
        'filteredPosts':[],
        'showPosts':[]
    }; 
    this.componentDidMount = this.componentDidMount.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.clearAll = this.clearAll.bind(this);
    this.handleAddition= this.handleAddition.bind(this);
    this.handleDelete= this.handleDelete.bind(this);
    this.handleDrag= this.handleDrag.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.arrayContainsArray = this.arrayContainsArray.bind(this);
    this.filterPosts = this.filterPosts.bind(this);
    this.cancel = this.cancel.bind(this);
    this.search = this.search.bind(this);
  }

  componentDidMount(){
    this.getPost();
     var tagsRef = firebase.database().ref('CSE/tags');
    tagsRef.on('value', (snapshot) => {
        this.setState({universalTags:snapshot.val()});
    });
  }  
  filterPosts(){
    var instr = this.state.instructorChecked;
    var unread = this.state.unreadChecked;
    var unans = this.state.unansweredChecked;
    var follow = this.state.followingChecked;
    var sTags= [];
    this.state.tags.map((tag)=>{
      sTags.push(tag.text);
    });
    var posts = [];
    var flag = true;
    this.state.posts.map( (post) => {
        if(this.arrayContainsArray(post.tags, sTags)){
          posts.push(post);
        }
    });
    this.setState({showPosts:posts, filteredPosts: posts});
  }
  handleChange(event) {
    var field = event.target.name;
    var value = event.target.checked;
    var changes = {}; //object to hold changes
    changes[field] = value; //change this field
    this.setState(changes); //update state
  }
  close() {
    this.setState({ showModal: false });
    this.filterPosts();
  }
   cancel() {
    this.setState({ showModal: false });
  }
   clearAll() {
    this.setState({ showPosts:this.state.posts, showModal: false  });
    console.log(this.state.showPosts);
  }

  open() {
    this.setState({ showModal: true });
  }
  getPost(){
    this.postRef = firebase.database().ref('CSE/post');
    this.postRef.on('value', (snapshot) => {
      var postsArray = []; 
      //going through posts and pushing the value into array
      snapshot.forEach(function(child){
        var post = child.val();
        post.key = child.key; //save the unique id for later
        postsArray.push(post); //make into an array
      });
      //sorting the array by time
      postsArray.sort((a,b) => b.time - a.time); //reverse order
      
      this.setState({posts:postsArray, showPosts:postsArray});
    });
  }
  arrayContainsArray(superset, subset) {
    return subset.every(function (value) {
      return (superset.indexOf(value) >= 0);
    });
  }
    handleDelete(i) {
        let tags = this.state.tags;
        tags.splice(i, 1);
        this.setState({tags: tags});
    }
   handleAddition(tag) {
        let tags = this.state.tags;
        tags.push({
            id: tags.length + 1,
            text: tag
        });
        this.setState({tags: tags});
    }
  
    handleDrag(tag, currPos, newPos) {
        let tags = this.state.tags;
 
        // mutate array 
        tags.splice(currPos, 1);
        tags.splice(newPos, 0, tag);
 
        // re-render 
        this.setState({ tags: tags });
    }
    search(event){
      console.log(event.which);
      if(event.which === 13){

        console.log("you searched!");
      }
    }
  render() {
    
    let tags = this.state.tags;
    let suggestions = this.state.universalTags;
    var postItems = this.state.showPosts.map((post) => {
        return <PostPreview post={post} key={post.key} />
    });
    return (<div>
       <Link to= {"/newpost/"}><Button bsStyle="primary">New post</Button></Link>
       <input type="text" placeholder="Search" onKeyPress={(e) => this.search(e)}/><Button onClick={this.open} >Filter</Button>
        
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Filter</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-xs-6">
                <input type="checkbox" name="instructorChecked" value="Instructor" onChange={this.handleChange}/>Instructor Posts
              </div>
              <div className="col-xs-6">
                <input type="checkbox" name="Unread" value="Unread" onChange={this.handleChange}/>Unread 
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <input type="checkbox" name="unansweredChecked" value="Unanswered" onChange={this.handleChange}/>Unanswered
              </div>
              <div className="col-xs-6">
                <input type="checkbox" name="followingChecked" value="Following" onChange={this.handleChange}/>Following
              </div>
            </div>

              <ReactTags tags={tags}
                    suggestions={suggestions}
                    handleDelete={this.handleDelete}
                    handleAddition={this.handleAddition}
                    handleDrag={this.handleDrag} />

          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Done</Button>
            <Button onClick={this.clearAll}>Clear All</Button>
             <Button onClick={this.cancel}>Cancel</Button>
          </Modal.Footer>
        </Modal>
          {postItems}
    </div>);
  }
}

class PostPreview extends Component {
  constructor(props){
    super(props);
    this.pushPost = this.pushPost.bind(this);
  }

  pushPost(e){
      hashHistory.push("/post/"+this.props.post.key);
  }
  render() {
    var headerTitle = this.props.location;
    var post = this.props.post;
    var tags = post.tags.map((tag, index) => {
      return <Label bsStyle="info" key= {index}>{tag}</Label>;
    });
    var isInstr = false;
    if(post.userType==="Instructor"){
      isInstr =true;
    }
    

    return (
      <div className="panel panel-default panel-info">
                <div className="panel-body pointer" onClick={(e) => this.pushPost(e)}>
                    <h3 className="panel-title">{post.title}</h3>
                     {isInstr && <Label bsStyle="warning">Instr Post</Label>}
                </div>
                <div className="panel-footer">
                    {tags}
                </div>
            </div>
  );
  }
}

class PostLarge extends Component {
  render() {
    return (<div></div>);
  }
}

class MainDefault extends Component {

  render() {
    return (<div></div>);
  }
}
export default App;
