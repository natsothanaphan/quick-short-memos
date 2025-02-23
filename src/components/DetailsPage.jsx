import React, { useState } from 'react';
import './DetailsPage.css';
import '../common.css';
import api from '../api.js';
import { formatTimestamp, formatTimestampForDatetimeLocal, formatDay } from '../utils.js';

export default function DetailsPage({
  user, memo, onChangeMemo, onBack,
 }) {
  const [currentMemo, setCurrentMemo] = useState(memo);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(memo.title);
  const [timestamp, setTimestamp] = useState(formatTimestampForDatetimeLocal(memo.timestamp));
  const [content, setContent] = useState(memo.content);

  const handleEdit = () => setEditing(true);
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this memo?')) return;
    try {
      const idToken = await user.getIdToken();
      await api.deleteMemo(idToken, currentMemo.id);
      const oldDay = formatDay(new Date(currentMemo.timestamp));
      onChangeMemo((memos) => {
        let hasIt = false;
        memos[oldDay] = memos[oldDay].filter((m) => {
          const isIt = m.id === currentMemo.id;
          if (isIt) hasIt = true;
          return !isIt;
        });
        if (!hasIt) {
          console.log('delete memo: already not there');
          return memos;
        }
        return memos;
      });
      alert('Memo deleted');

      onBack();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const timestampDate = new Date(timestamp);
    try {
      const idToken = await user.getIdToken();
      const rawUpdatedMemo = await api.updateMemo(idToken, currentMemo.id, {
        timestamp: timestampDate.toISOString(), title, content,
      });
      const updatedMemo = {
        id: rawUpdatedMemo.id,
        timestamp: rawUpdatedMemo.timestamp,
        title: rawUpdatedMemo.title,
        content: rawUpdatedMemo.content,
      };

      setTitle(updatedMemo.title);
      setTimestamp(formatTimestampForDatetimeLocal(updatedMemo.timestamp));
      setContent(updatedMemo.content);
      setEditing(false);
      setCurrentMemo(updatedMemo);
      const oldDay = formatDay(new Date(currentMemo.timestamp));
      const newDay = formatDay(timestampDate);
      onChangeMemo((memos) => {
        let hasIt = false;
        memos[oldDay] = memos[oldDay].filter((m) => {
          const isIt = m.id === currentMemo.id;
          if (isIt) hasIt = true;
          return !isIt;
        });
        if (!hasIt) {
          console.log('update memo: already not there');
          return memos;
        }
        if (memos[newDay]) {
          memos[newDay] = [updatedMemo, ...memos[newDay]]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
        return memos;
      });
    } catch (err) {
      alert(err.message);
    }
  };
  const handleCancel = () => setEditing(false);

  return (
    <>
      <div className="memo-info">
        {!editing && <>
          <h1>{currentMemo.title}</h1>
          <p>{formatTimestamp(currentMemo.timestamp)}</p>
          <pre>{currentMemo.content}</pre>
          <button onClick={handleEdit} title="Edit">✏️</button>{' '}
          <button onClick={handleDelete} title="Delete">🗑️</button>
        </>}
        {editing && <form className="edit-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor=".details-title">Title</label>
            <input id=".details-title" type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor=".details-timestamp">Timestamp</label>
            <input id=".details-timestamp" type="datetime-local" value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor=".details-content">Content</label>
            <textarea id=".details-content" value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5} required
            />
          </div>
          <div className="edit-form-buttons">
            <button type="submit" title="Save">💾</button>
            <button onClick={handleCancel} title="Cancel">❌</button>
          </div>
        </form>}
      </div>
      <button className="back-button" onClick={onBack}>Back</button>
    </>
  );
};
