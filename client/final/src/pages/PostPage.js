import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import "./postPage.css";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [showRegisteredUsers, setShowRegisteredUsers] = useState(false);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();

  useEffect(() => {
    fetch(`http://localhost:4000/post/${id}`)
      .then((response) => {
        response.json().then((postInfo) => {
          setPostInfo(postInfo);
        });
      });
  }, [id]);

  const isUserRegistered = () => {
    if (!postInfo || !userInfo) return false;
    return postInfo.registeredUsers.some((userId) => userId === userInfo.id);
  };

  const handleRegister = async (postId) => {
    if (!userInfo) {
      alert("Please log in to register for the opportunity.");
      return;
    }

    const userId = userInfo.id;
    try {
      const response = await fetch(`http://localhost:4000/register/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
        credentials: 'include',
      });
      if (response.ok) {
        const updatedPost = await response.json();
        console.log(updatedPost);
        setPostInfo(updatedPost);
        setRegistrationSuccess(true);
      } else {
        console.error('Failed to register for the post');
      }
    } catch (error) {
      console.error('Error registering for the post:', error);
    }
  };

  const handleUnregister = async (postId) => {
    if (!userInfo) {
      alert("Please log in to unregister from the opportunity.");
      return;
    }

    const userId = userInfo.id;
    try {
      const response = await fetch(`http://localhost:4000/register/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
        credentials: 'include',
      });
      if (response.ok) {
        const updatedPost = await response.json();
        console.log(updatedPost);
        setPostInfo(updatedPost);
      } else {
        console.error('Failed to unregister from the post');
      }
    } catch (error) {
      console.error('Error unregistering from the post:', error);
    }
  };

  const fetchRegisteredUsers = async (postId) => {
    try {
      const response = await fetch(`http://localhost:4000/posts/${postId}/registeredUsers`);
      if (response.ok) {
        const registeredUsers = await response.json();
        setRegisteredUsers(registeredUsers);
        setShowRegisteredUsers(true);
      } else {
        console.error('Failed to fetch registered users');
      }
    } catch (error) {
      console.error('Error fetching registered users:', error);
    }
  };

  if (!postInfo) return null;

  return (
    <div className="post-page">
      <h1>
        {postInfo.title}
        <div className="register-container">
          {userInfo && (
            <>
              <button
                onClick={() => handleRegister(postInfo._id)}
                className={isUserRegistered() ? "registered" : ""}
              >
                {isUserRegistered() ? "Registered" : "Register for Opportunity"}
              </button>
              <button onClick={() => handleUnregister(postInfo._id)}>Unregister</button>
            </>
          )}
          {!userInfo && (
            <button onClick={() => alert("Please log in to register for the opportunity.")}>
              Register for Opportunity
            </button>
          )}
          <button onClick={() => fetchRegisteredUsers(postInfo._id)}>Registered Users</button>
        </div>
      </h1>
      {registrationSuccess && <div className="success-message">Successfully registered!</div>}
      {showRegisteredUsers && (
        <div className="registered-users">
          <h3>Registered Users:</h3>
          <ul>
            {registeredUsers.map((user) => (
              <li key={user.id}>@{user.username}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="date-info">
        {postInfo.lastDate && (
          <div className="last-updated-date">
            <span>REGISTRATION DEADLINE:</span>
            <time>{formatISO9075(new Date(postInfo.lastDate))}</time>
          </div>
        )}
      </div>
      <div className="author">by @{postInfo.author.username}</div>
      {userInfo && userInfo.id === postInfo.author._id && (
        <div className="edit-row">
          <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            Edit this post
          </Link>
        </div>
      )}
      <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
        <img
          src={`http://localhost:4000/${postInfo.cover}`}
          alt=""
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
      <div className="content" dangerouslySetInnerHTML={{ __html: postInfo.content }} />
    </div>
  );
}
