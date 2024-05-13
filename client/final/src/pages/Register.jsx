import { useState } from "react";
import './register.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function register(ev) {
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 200) {
      alert('Registration successful');
    } else {
      alert('Registration failed');
    }
  }

  return (
    <form className="register-form" onSubmit={register}>
      <h1 className="register-heading">Register</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={ev => setUsername(ev.target.value)}
        className="register-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={ev => setPassword(ev.target.value)}
        className="register-input"
      />
      <button type="submit" className="register-button">Register</button>
    </form>
  );
}
