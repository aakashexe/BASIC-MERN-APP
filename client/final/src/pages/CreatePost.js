import { useState } from "react";
import { Navigate } from "react-router-dom";
import './createPost.css';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState('');
  const [lastDate, setLastDate] = useState('');
  const [redirect, setRedirect] = useState(false);

  async function createNewPost(ev) {
    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('file', files[0]);
    data.set('lastDate', lastDate); 
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/post', {
      method: 'POST',
      body: data,
      credentials: 'include',
    });
    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }

  return (
    <form className="create-post-form" onSubmit={createNewPost}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={ev => setTitle(ev.target.value)}
        className="create-post-input"
      />
      <input
        type="text"
        placeholder="Summary"
        value={summary}
        onChange={ev => setSummary(ev.target.value)}
        className="create-post-input"
      />
      <input
        type="file"
        onChange={ev => setFiles(ev.target.files)}
        className="create-post-input"
      />
      <input
        type="date"
        placeholder="Last Date"
        value={lastDate}
        onChange={ev => setLastDate(ev.target.value)}
        className="create-post-input"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={ev => setContent(ev.target.value)}
        className="create-post-textarea"
      />
      <button type="submit" className="create-post-button">Create Post</button>
    </form>
  );
}
