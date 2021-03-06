import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { hashHistory } from "react-router";
import firebase from "firebase";
import Time from "react-time";

// This component shows a post title, content, writer info, and comments 
class IndividualPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = { post: undefined };
    }
    
    componentDidMount() {
        this.searchPosts(this.props.params);
    }

    // searches for the post user clicked in to find ref 
    searchPosts(param) {
        var postKey = param.post;
        this.postsRef = firebase.database().ref("CSE/post");
        var thisPost = "placeholder";
        this.postsRef.on('value', (snapshot) => {
            //going through posts and pushing the value into array
          
            thisPost = snapshot.val()[postKey];
            this.setState({ post: thisPost });
        });
    }
    home(){
        hashHistory.push("/");
    }
    componentWillReceiveProps(nextProps){
    this.searchPosts(nextProps.params);
  }
    componentWillUnmount = () => {
        this.postsRef.off();
    }

    // how it displays
    render() {
        return (
            <div role="region">
                {!this.state.post &&
                    <h3 role="banner">loading...</h3>
                }
                {this.state.post &&
                    <div role="region" aria-label="Post">
                        <span className="pull-right pointer" onClick={this.home}>&times;</span>
                        <div aria-label="Writer Info">
                            <h2 role="banner" aria-label="Post Title">{this.state.post.title}</h2>
                            <p aria-label="Author Handle">{this.state.post.handle} at <Time value={this.state.post.time} relative /></p>
                            <p className="white-space" aria-label="Content">{this.state.post.text}</p>
                        </div>
                        <div className="comments-box" role="region" aria-label="Comments">
                            <label>Leave A Comment</label>
                            <PostForm role="form" post={this.props.params.post} writer={this.state.post.userId} />
                            <div className="comments" role="region">
                                <CommentList post={this.props.params.post} writer={this.state.post.userId} />
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }

}

// A component that displays post form for comment 
class PostForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { comment: '', loading: false }
    }

    // updates current state with new comment
    updateComment(event) {
        this.setState({ comment: event.target.value });
    }

    // posts a new comment
    postComment(event) {
        event.preventDefault(); //don't submit
        this.setState({ loading: true });

        /* Add a new Chat to the database */
        var commentsRef = firebase.database().ref('CSE/post/' + this.props.post.key + '/comments'); //the comments in the post
        var newComment = {
            text: this.state.comment,
            userId: firebase.auth().currentUser.uid, //to look up user info
            handle: firebase.auth().currentUser.displayName, // user handle
            time: firebase.database.ServerValue.TIMESTAMP, //MAGIC
        };
        commentsRef.push(newComment).then((response) => { this.setState({ loading: false }) }); //upload

        this.setState({ comment: '' }); //empty out post (controlled input)
    }

    // how to display
    render() {
        return (
            <div>
                {this.state.loading &&
                    <p className="loading">Uploading...</p>
                }
                <form role="form" aria-label="Comment Form" className="form-group">
                    <textarea type="text" placeholder="Type comment here..." value={this.state.comment} className="form-control" onChange={(e) => this.updateComment(e)} />
                    <Button aria-label="Post" className="btn btn-primary btn-block" disabled={this.state.comment.length === 0 } onClick={(e) => this.postComment(e)} >Post</Button>
                </form>
            </div>
        );
    }
}

// This component shows a list of comments on a post
class CommentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { comments: [] };
    }

    componentDidMount() {
        /* Add a listener for changes to the user details object, and save in the state */
        var usersRef = firebase.database().ref('users');
        usersRef.on('value', (snapshot) => {
            this.setState({ users: snapshot.val() });
        });

        this.getComments();
    }

    componentWillReceiveProps() {
        this.getComments();
    }

    // gets all comments from the selected post
    getComments() {
        var commentsRef = firebase.database().ref('Users/' + this.props.writer + '/published/' + this.props.post + '/comments'); //the chats in the channel
        commentsRef.on('value', (snapshot) => {
            var commentArray = []; //could also do this processing in render
            snapshot.forEach(function (child) {
                var comment = child.val();
                comment.key = child.key; //save the unique id for later
                commentArray.push(comment); //make into an array

            });
            this.setState({ comments: commentArray });
        });
    }

    // how to display
    render() {
        //don't show if don't have comment data yet (to avoid partial loads)
        if (!this.state.comments) {
            return null;
        }

        /* Create a list of <CommentItem /> objects */
        var commentItems = this.state.comments.map((comment) => {
            return <CommentItem aria-label="comment" comment={comment}
                post={this.props.post} postWriter={this.props.writer} key={comment.key} />
        });

        var commentDisplay = "";
        if (commentItems.length === 1) {
            commentDisplay = "Comment";
        } else {
            commentDisplay = "Comments";
        }

        return (
            <div role="region">
                <p>{commentItems.length} {commentDisplay}</p>
                {commentItems}
            </div>);
    }
}

// This component shows a comment, allows users to edit, delete their comment
class CommentItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editShow: false, deleteShow: false, text: this.props.comment.text, edited: false };
    }

    // updates the current state with new edit
    updateText(event) {
        this.setState({ text: event.target.value });
    }

    // updates the comment with new edited comment
    editPost() {
        var commentRef = firebase.database().ref("Users/" + this.props.postWriter + "/published/" + this.props.post + "/comments/" + this.props.comment.key);
        commentRef.child("text").set(this.state.text);
        commentRef.child("editTime").set(firebase.database.ServerValue.TIMESTAMP);
        this.setState({ edited: true });
        window.setTimeout(() => {
            this.setState({ edited: false });
        }, 1500);
    }

    // deletes a comment
    deleteComment() {
        var commentRef = firebase.database().ref("Users/" + this.props.postWriter + "/published/" + this.props.post + "/comments/" + this.props.comment.key);
        commentRef.remove();
    }

    // how to display
    render() {
        let editClose = () => this.setState({ editShow: false });
        let deleteClose = () => this.setState({ deleteShow: false });

        return (
            <div className="panel panel-default panel-info">
                <div className="panel-heading">
                    <p className="panel-title">{this.props.comment.handle || this.props.comment.userId}
                        {this.props.comment.editTime === undefined &&
                            <span> Posted <Time value={this.props.comment.time} relative /></span>
                        }
                        {this.props.comment.editTime &&
                            <span> Edited <Time value={this.props.comment.editTime} relative /></span>
                        }
                    </p>
                </div>
                <div className="panel-body white-space">
                    <p className="comment-text white-space">{this.props.comment.text}</p>
                </div>
                {this.props.comment.userId === firebase.auth().currentUser.uid &&
                    <div className="panel-footer">
                        <Button aria-label="Edit" bsSize="small" onClick={() => this.setState({ editShow: true })}>Edit</Button>
                        <Button aria-label="Delete" bsStyle="danger" bsSize="small" onClick={() => this.setState({ deleteShow: true })}>Delete</Button>
                    </div>
                }

                <Modal show={this.state.editShow} onHide={editClose} bsSize="large" aria-labelledby="contained-modal-title-lg">
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-lg">
                            <p>Edit</p>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <textarea defaultValue={this.props.comment.text} className="post-form form-control" onChange={(e) => this.updateText(e)} />
                        {this.state.edited &&
                            <Alert bsStyle="success">
                                <strong>Edited!</strong>
                            </Alert>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button aria-label="Save" bsStyle="primary" onClick={() => this.editPost()}>Save</Button>
                        <Button aria-label="Cancel" onClick={editClose}>Cancel</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.deleteShow} onHide={deleteClose} bsSize="small" aria-labelledby="contained-modal-title-sm">
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-sm">
                            Are you sure?
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        This will permanently delete your comment.
                </Modal.Body>
                    <Modal.Footer>
                        <Button aria-label="Delete" bsStyle="danger" onClick={() => this.deleteComment()}>Yes</Button>
                        <Button aria-label="Cancel" onClick={deleteClose}>No</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default IndividualPost;