import React, { useState, useEffect } from 'react';
import Banner from "../../components/banner/Banner";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import "./Comments.css";
import { db } from "../../firebase/config";
import { ref, onValue, set } from "firebase/database";

function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [newComment, setNewComment] = useState({
    username: '',
    character: '',
    comment: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    const commentsRef = ref(db, 'data/comments');
    
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setComments(data);
      } else {
        setComments([]);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const commentsRef = ref(db, 'data/comments');
    
    let updatedComments;
    if (editingComment !== null) {
      updatedComments = comments.map((comment, index) => 
        index === editingComment ? newComment : comment
      );
    } else {
      updatedComments = [...comments, newComment];
    }
    
    set(commentsRef, updatedComments);
    
    setNewComment({
      username: '',
      character: '',
      comment: ''
    });
    setShowForm(false);
    setEditingComment(null);
  };

  const handleEdit = (index) => {
    setNewComment(comments[index]);
    setEditingComment(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    setCommentToDelete(index);
    setShowModal(true);
  };

  const confirmDelete = () => {
    const commentsRef = ref(db, 'data/comments');
    const updatedComments = comments.filter((_, i) => i !== commentToDelete);
    set(commentsRef, updatedComments);
    setShowModal(false);
    setCommentToDelete(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <Banner title={"Comments"} />
      <div className="comments-container">
        <button 
          className="add-comment-btn"
          onClick={() => {
            setShowForm(!showForm);
            setEditingComment(null);
            setNewComment({ username: '', character: '', comment: '' });
          }}
        >
          {showForm ? 'Cancel' : 'Add New Comment'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Username"
              value={newComment.username}
              onChange={(e) => setNewComment({...newComment, username: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Character"
              value={newComment.character}
              onChange={(e) => setNewComment({...newComment, character: e.target.value})}
              required
            />
            <textarea
              placeholder="Your comment"
              value={newComment.comment}
              onChange={(e) => setNewComment({...newComment, comment: e.target.value})}
              required
            />
            <button type="submit">
              {editingComment !== null ? 'Update Comment' : 'Add Comment'}
            </button>
          </form>
        )}

        <div className="comments-list">
          {comments.map((comment, index) => (
            <div key={index} className="comment-card">
              <div className="comment-header">
                <h3>{comment.username}</h3>
                <span className="character-name">Character: {comment.character}</span>
              </div>
              <p className="comment-text">{comment.comment}</p>
              <div className="comment-actions">
                <button onClick={() => handleEdit(index)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(index)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this comment?</p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="confirm-btn">Yes</button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Comments;