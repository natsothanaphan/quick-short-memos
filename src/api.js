const ping = async (token) => {
  console.log('api ping start', {});
  const resp = await fetch(`/api/ping`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api ping error', { errData });
    throw new Error(errData.error || 'Failed api ping');
  }
  const data = await resp.text();
  console.log('api ping done', { data });
  return data;
};

const createMemo = async (token, memo) => {
  console.log('api createMemo start', { memo });
  const { timestamp, title, content } = memo;
  const resp = await fetch(`/api/memos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ timestamp, title, content }),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api createMemo error', { errData });
    throw new Error(errData.error || 'Failed to create memo');
  }
  const data = await resp.json();
  console.log('api createMemo done', { data });
  return data;
};

// day should be in the 'YYYY-MM-DD' format and timezone in minutes.
const getMemos = async (token, day, timezone) => {
  console.log('api getMemos start', { day, timezone });
  const url = `/api/memos?day=${encodeURIComponent(day)}&timezone=${encodeURIComponent(timezone)}`;
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api getMemos error', { errData });
    throw new Error(errData.error || 'Failed to get memos');
  }
  const data = await resp.json();
  console.log('api getMemos done', { data });
  return data;
};

const updateMemo = async (token, memoId, updateFields) => {
  console.log('api updateMemo start', { memoId, updateFields });
  const resp = await fetch(`/api/memos/${memoId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updateFields),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api updateMemo error', { errData });
    throw new Error(errData.error || 'Failed to update memo');
  }
  const data = await resp.json();
  console.log('api updateMemo done', { data });
  return data;
};

const deleteMemo = async (token, memoId) => {
  console.log('api deleteMemo start', { memoId });
  const resp = await fetch(`/api/memos/${memoId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api deleteMemo error', { errData });
    throw new Error(errData.error || 'Failed to delete memo');
  }
  console.log('api deleteMemo done');
};

export default {
  ping, createMemo, getMemos, updateMemo, deleteMemo,
};
