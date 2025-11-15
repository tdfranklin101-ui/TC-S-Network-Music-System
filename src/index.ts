import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, songs, playEvents } from '@tcs-network/shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'music-system' });
});

app.get('/api/songs', async (req, res) => {
  try {
    const allSongs = await db.select().from(songs).where({ isActive: true });
    res.json(allSongs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

app.post('/api/play/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    const playEvent = await db.insert(playEvents).values({
      songId,
      source: 'web',
      userAgent: req.headers['user-agent']
    }).returning();
    res.json(playEvent[0]);
  } catch (error) {
    console.error('Error recording play event:', error);
    res.status(500).json({ error: 'Failed to record play event' });
  }
});

app.listen(PORT, () => {
  console.log(`Music System API running on port ${PORT}`);
});
