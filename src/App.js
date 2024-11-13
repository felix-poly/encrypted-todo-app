
import React, { useEffect, useState } from "react";
import forge from "node-forge";

function App() {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzW1RiGe5tZ1+KHn0bHFmQ
S0Tj3G0qkLML+5wq7t6xh5XowgGz8jp6du2cgl0sBePQFk1oiGdxhccgMkmjjVr5
SHmrXYeG1bUpBpi9lDzJkH0dz2CjddPQo2bd9U1FV0ovP3X1TzSzPAu7xyL6rEHL
3y2bZ0QauTKv8n5B2fxHcuuyZ6tzGbBR2O1OjJ6GrREH5U/qlHgUm5Z3gdcVS7MY
SlcnpACvD9py0xuwxuXnvabdpbA+aLhL45bfhvMzQq5yNqWGTkj2y/VrNl1eq4bD
rjggRAzX41SmqFzcn6gm6LqRxcpb+nqbgqCvYoJnm7rw8p91REf8oet5JbYj7cZk
yQIDAQAB
-----END PUBLIC KEY-----`;

  const decryptRsa = (encryptedBase64) => {
    try {
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
      const encryptedBytes = forge.util.decode64(encryptedBase64);
      const decrypted = publicKey.decrypt(encryptedBytes, 'RSA-OAEP');
      return decrypted;
    } catch (error) {
      return `Decryption failed: ${encryptedBase64}`;
    }
  };

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch("encrypted_todos.txt");
        if (!response.ok) {
          throw new Error("File not found or there was an issue fetching the file");
        }
        const text = await response.text();
        const todoList = text
          .split("\n")
          .map((encodedLine, index) => ({
            id: index + 1,
            text: decryptRsa(encodedLine.trim()),
          }))
          .filter(todo => todo.text); 

        setTodos(todoList);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);

    return (
    <div className="App">
      <h1>Todo List</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

