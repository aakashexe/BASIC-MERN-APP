import Post from "../Post";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:4000/post')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();4
      })
      .then(posts => {
        setPosts(posts);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
      });
  }, []);
  
  return (
    <>
      {posts && posts.length > 0 && posts.map(post => (
        <Post key={post.id} {...post} />
      ))}
    </>
  );
}
