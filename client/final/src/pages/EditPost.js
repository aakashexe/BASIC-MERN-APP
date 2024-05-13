import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import './editPost.css';

export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState('');
  const [lastDate, setLastDate] = useState('');
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    fetch('http://localhost:4000/post/' + id)
      .then(response => {
        response.json().then(postInfo => {
          setTitle(postInfo.title);
          setContent(postInfo.content);
          setSummary(postInfo.summary);
          setLastDate(postInfo.lastDate ? postInfo.lastDate : ''); 
        });
      });
  }, []);

  async function updatePost(ev) {
    ev.preventDefault();
    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('id', id);
    data.set('lastDate', lastDate); 
    if (files?.[0]) {
      data.set('file', files?.[0]);
    }
    const response = await fetch('http://localhost:4000/post', {
      method: 'PUT',
      body: data,
      credentials: 'include',
    });
    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={'/post/' + id} />
  }

  return (
    <form className="edit-post-form" onSubmit={updatePost}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={ev => setTitle(ev.target.value)}
        className="edit-post-input"
      />
      <input
        type="text"
        placeholder="Summary"
        value={summary}
        onChange={ev => setSummary(ev.target.value)}
        className="edit-post-input"
      />
      <input
        type="file"
        onChange={ev => setFiles(ev.target.files)}
        className="edit-post-input"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={ev => setContent(ev.target.value)}
        className="edit-post-textarea"
      />
      <label htmlFor="lastDate">Last Date:</label> 
      <input
        type="date"
        id="lastDate"
        value={lastDate}
        onChange={ev => setLastDate(ev.target.value)}
        className="edit-post-input"
      />
      <button type="submit" className="edit-post-button">Update Post</button>
    </form>
  );
}
