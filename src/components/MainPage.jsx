import React, { useState, useEffect } from 'react';
import './MainPage.css';
import '../common.css';
import api from '../api.js';
import { formatTimestamp, formatDay, getTimezone } from '../utils.js';

export default function MainPage({
  user, previousMemosByDay, previousSelectedDay, onFetchMemos, onSelectDay, onSelectMemo,
}) {
  const timezone = getTimezone();

  const [memos, setMemos] = useState(previousMemosByDay);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(
    previousSelectedDay || formatDay(new Date()),
  );

  const [title, setTitle] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [content, setContent] = useState('');
  const [adding, setAdding] = useState(false);

  const updateMemosByDay = (callback) => {
    const newMemosByDay = callback(memos);
    setMemos(newMemosByDay);
    onFetchMemos(newMemosByDay);
  };

  const fetchMemos = async () => {
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const memos = await api.getMemos(token, selectedDay, timezone);

      updateMemosByDay((prevMemos) => ({
        ...prevMemos,
        [selectedDay]: memos,
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemo = async (e) => {
    e.preventDefault();
    setAdding(true);
    const timestampDate = new Date(timestamp);
    try {
      const token = await user.getIdToken();
      const memoPayload = {
        timestamp: timestampDate.toISOString(),
        title,
        content,
      };
      const resultMemoPayload = await api.createMemo(token, memoPayload);

      setTitle('');
      setTimestamp('');
      setContent('');
      const timestampDay = formatDay(timestampDate);
      updateMemosByDay((prevMemos) => ({
        ...prevMemos,
        [timestampDay]: [resultMemoPayload, ...(prevMemos[timestampDay] || [])]
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    onSelectDay(day);
  };

  const handleSelectMemo = (memo) => onSelectMemo(memo);

  const handleReload = () => fetchMemos();

  useEffect(() => {
    if (!memos[selectedDay]) {
      fetchMemos();
    }
  }, [selectedDay]);

  const displayedMemos = memos[selectedDay] || [];

  return (
    <>
      <section className="add-memo">
        <h2>Add memo</h2>
        <form onSubmit={handleAddMemo}>
        <div>
            <label htmlFor=".add-title">Title</label>
            <input id=".add-title" type="text" value={title}
              onChange={(e) => setTitle(e.target.value)} required
            />
          </div>
          <div>
            <label htmlFor=".add-timestamp">Timestamp</label>
            <input id=".add-timestamp" type="datetime-local" value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)} required
            />
          </div>
          <div>
            <label htmlFor=".add-content">Content</label>
            <textarea id=".add-content" value={content}
              onChange={(e) => setContent(e.target.value)} rows={5} required
            />
          </div>
          <button type="submit" disabled={adding}>{adding ? 'Loading...' : 'Add'}</button>
        </form>
      </section>

      <section className="memos-list">
        <input type="date" value={selectedDay}
          onChange={(e) => handleSelectDay(e.target.value)} />
        {loading && <p>Loading...</p>}
        {!loading && displayedMemos.length === 0 && <p>No memos found.</p>}
        {!loading && displayedMemos.length > 0 && <ul>{displayedMemos.map((memo) => (
            <li key={memo.id}>
              <a href="#" onClick={() => handleSelectMemo(memo)}>
                <span>{formatTimestamp(memo.timestamp)}</span>
                <span>{' ➡️ '}</span>
                <span>{memo.title}</span>
              </a>
            </li>
          ))}</ul>}
        {!loading && <button className="reload-button" onClick={handleReload}>
          Reload
        </button>}
      </section>
    </>
  );
};
