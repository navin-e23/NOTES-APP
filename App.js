import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { openDB } from 'idb';

const secretKey = 'my-very-secure-key';

const encrypt = (text) => CryptoJS.AES.encrypt(text, secretKey).toString();
const decrypt = (cipher) => CryptoJS.AES.decrypt(cipher, secretKey).toString(CryptoJS.enc.Utf8);

const initDB = async () => {
  return openDB('notes-db', 1, {
    upgrade(db) {
      db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
    },
  });
};

function App() {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);

  const loadNotes = async () => {
    const db = await initDB();
    const allNotes = await db.getAll('notes');
    setNotes(allNotes.map(n => ({ ...n, content: decrypt(n.content) })));
  };

  const saveNote = async () => {
    if (!note.trim()) return;
    const db = await initDB();
    const encrypted = encrypt(note);
    await db.add('notes', { content: encrypted, createdAt: new Date() });
    setNote('');
    loadNotes();
  };

  const deleteNote = async (id) => {
    const db = await initDB();
    await db.delete('notes', id);
    loadNotes();
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Encrypted Notes</h1>
      <textarea
        rows="4"
        cols="50"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write a secure note..."
      />
      <br />
      <button onClick={saveNote}>Save Note</button>
      <h2>Saved Notes</h2>
      <ul>
        {notes.map((n) => (
          <li key={n.id}>
            {n.content}
            <button onClick={() => deleteNote(n.id)} style={{ marginLeft: 10 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;