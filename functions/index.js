require('dotenv').config({ path: ['.env', '.env.default'] });
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const express = require('express');

setGlobalOptions({ region: 'asia-southeast1' });
initializeApp();
const db = getFirestore();

const app = express();
app.use(express.json());

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
app.use(authenticate);

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

app.post('/api/memos', async (req, res) => {
  const { timestamp, title, content } = req.body;
  if (!timestamp || !title || !content) {
    return res.status(400).json({ error: 'Timestamp, title, content are required' });
  }
  
  const memoTimestamp = new Date(timestamp);
  if (isNaN(memoTimestamp.getTime())) {
    return res.status(400).json({ error: 'Invalid timestamp' });
  }
  memoTimestamp.setSeconds(0, 0); // round to minute
  const memoData = {
    timestamp: memoTimestamp,
    title,
    content,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db
      .collection('users')
      .doc(req.uid)
      .collection('memos')
      .add(memoData);
    return res.status(201).json({ id: docRef.id, ...memoData });
  } catch (error) {
    logger.error('Error creating memo:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/memos', async (req, res) => {
  const dayStr = req.query.day;
  if (!dayStr) {
    return res.status(400).json({ error: 'Day is required' });
  }
  if (dayStr.length !== 10) {
    return res.status(400).json({ error: 'Invalid day format. Expected format: YYYY-MM-DD' });
  }
  const rawTargetDate = new Date(dayStr);
  if (isNaN(rawTargetDate.getTime())) {
    return res.status(400).json({ error: 'Invalid day format. Expected format: YYYY-MM-DD' });
  }
  const timezone = req.query.timezone;
  if (!timezone) {
    return res.status(400).json({ error: 'Timezone is required' });
  }
  const timezoneOffset = parseInt(timezone, 10);
  if (isNaN(timezoneOffset)) {
    return res.status(400).json({
      error: 'Invalid timezone parameter. Expected integer representing minutes',
    });
  }

  const startTime = new Date(rawTargetDate);
  startTime.setMinutes(startTime.getMinutes() - timezoneOffset);
  const endTime = new Date(startTime);
  endTime.setDate(endTime.getDate() + 1);
  logger.info(`startTime: ${startTime.toISOString()}, endTime: ${endTime.toISOString()}`);

  try {
    const memosSnapshot = await db
      .collection('users')
      .doc(req.uid)
      .collection('memos')
      .where('timestamp', '>=', startTime)
      .where('timestamp', '<', endTime)
      .orderBy('timestamp', 'asc')
      .get();
    const memos = [];
    memosSnapshot.forEach((doc) => {
      const data = doc.data();
      memos.push({ id: doc.id, ...data,
        timestamp: data.timestamp.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });
    return res.json(memos);
  } catch (error) {
    logger.error('Error retrieving memos:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/api/memos/:id', async (req, res) => {
  const memoId = req.params.id;
  const updateData = {};
  if (req.body.timestamp) {
    let updatedTimestamp = new Date(req.body.timestamp);
    if (isNaN(updatedTimestamp.getTime())) {
      return res.status(400).json({ error: 'Invalid timestamp' });
    }
    updatedTimestamp.setSeconds(0, 0); // round to minute
    updateData.timestamp = updatedTimestamp;
  }
  if (req.body.title) updateData.title = req.body.title;
  if (req.body.content) updateData.content = req.body.content;
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update' });
  }
  updateData.updatedAt = FieldValue.serverTimestamp();
  
  try {
    const memoRef = db.collection('users').doc(req.uid).collection('memos').doc(memoId);
    const doc = await memoRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Memo not found' });
    }
    await memoRef.update(updateData);
    const updatedDoc = await memoRef.get();
    const data = updatedDoc.data();
    return res.json({ id: memoId, ...data,
      timestamp: data.timestamp.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    });
  } catch (error) {
    logger.error('Error updating memo:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/memos/:id', async (req, res) => {
  const memoId = req.params.id;

  try {
    const memoRef = db.collection('users').doc(req.uid).collection('memos').doc(memoId);
    const doc = await memoRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Memo not found' });
    }
    await memoRef.delete();
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting memo:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

exports.app = onRequest(app);
