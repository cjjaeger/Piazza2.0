import React from "react";
import { hashHistory } from "react-router";
import firebase from "firebase";
import { WithContext as ReactTags } from 'react-tag-input';

class NewPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
                  post: '', 
                  title: '',  
                  tags:[], 
                  universalTags: [],
                  userType:''};

    this.handleAddition= this.handleAddition.bind(this);
    this.handleDelete= this.handleDelete.bind(this);
    this.handleDrag= this.handleDrag.bind(this);


  }



  //when the text in the form title or content form changes
  updatePost(event) {
    this.setState({ post: event.target.value });
  }
  updateTitle(event) {
    this.setState({ title: event.target.value });
  }
  updateUser(event) {
    this.setState({ userType: event.target.value });
  }
  //add post to published array in the database
  postPost(event) {
    event.preventDefault(); //don't submit
    var tags = [];
    this.state.tags.map((tag)=>{
      tags.push(tag.text);
    });

    var postsRef = firebase.database().ref('CSE/post'); //the chats in the channel
    var newPost = {
      text: this.state.post,
      userType: this.state.userType, //to look up user info
      tags: tags,
      time: firebase.database.ServerValue.TIMESTAMP, //getting the time
      title: this.state.title
    };
    postsRef.push(newPost); //upload

    this.setState({ post: '', title: '' }); //empty out post (controlled input)
    hashHistory.push('/');//redirecting to saved posts where they can see their new published story
  }
  componentDidMount() {
    var tagsRef = firebase.database().ref('CSE/tags');
    tagsRef.on('value', (snapshot) => {
        this.setState({universalTags:snapshot.val()});
    });
  }
 

  //testing whether title or post content inputs are empty
  validateTitle(title) {
    return (title.length > 0);
  }
  validatePost(post) {
    return (post.length > 0);
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
  // how to display
  render() {
    //determines if post or save buttons should be enabled
  
    let tags = this.state.tags;
    let suggestions = this.state.universalTags;
    var buttonEnabled = (this.validateTitle(this.state.title) && this.validatePost(this.state.post));
    return (
      <div  role="region">
        <h2>Post Your Work!</h2>
        <form className="message-input form-group" role="form">
          <label htmlFor="title">Title: </label>
          <input type="text" id="title" placeholder="Type title here..." name="input" className="post-form form-control input-lg" onChange={(e) => this.updateTitle(e)} />
         
          <label htmlFor="newPost" >Content:</label>
          <textarea id="newPost" role="textbox" aria-multiline="true" placeholder="Type post here..." name="text" className="post-form form-control" onChange={(e) => this.updatePost(e)} rows="5"/>

          <label className="radio-inline" htmlFor="radioI"><input id='radioI' type="radio" name="userType" value='Instructor' onChange={(e) => this.updateUser(e)}/>Instructor</label>
          <label className="radio-inline" htmlFor="radioS"><input id='radioS' type="radio" name="userType" value='Student' onChange={(e) => this.updateUser(e)}/>Student</label>
           <ReactTags tags={tags}
                    suggestions={suggestions}
                    handleDelete={this.handleDelete}
                    handleAddition={this.handleAddition}
                    handleDrag={this.handleDrag} />
          <div className="form-group new-post">
            {/* Disable if invalid post length */}
            <button className="btn btn-primary" disabled={!buttonEnabled}
              onClick={(e) => this.postPost(e)} >Post</button>
          </div>
        </form>
      </div>
    );
  }
}


export default NewPost;