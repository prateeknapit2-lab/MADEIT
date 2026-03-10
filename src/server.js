import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storyHistory = [
  { id: 1, title: 'A cyberpunk rescue', tags: ['cyberpunk', 'rescue'] },
  { id: 2, title: 'Village friendship drama', tags: ['village', 'friendship'] }
];

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', product: 'MaDE-iT' });
});

app.post('/api/story/analyze', (req, res) => {
  const { story = '', language = 'en', mode = 'web' } = req.body;

  if (!story.trim()) {
    return res.status(400).json({ error: 'Story is required.' });
  }

  const similar = storyHistory.find((item) =>
    item.tags.some((tag) => story.toLowerCase().includes(tag))
  );

  const webLimitations = {
    maxDurationSec: 45,
    maxCharacters: 2,
    voiceCloning: false,
    advancedFacialAnimation: false
  };

  const appCapabilities = {
    maxDurationSec: 600,
    maxCharacters: 12,
    voiceCloning: true,
    advancedFacialAnimation: true,
    multilingualDubbing: true,
    captionModes: ['none', 'auto', 'cinematic']
  };

  return res.json({
    mode,
    language,
    pipeline: ['script-breakdown', 'scene-plan', '3d-render', 'lip-sync', 'voice-over'],
    similarStory: similar
      ? {
          title: similar.title,
          alreadyCreated: true,
          suggestion:
            'Create a similar version by changing face topology, costume style, and environment theme.'
        }
      : { alreadyCreated: false },
    features: mode === 'app' ? appCapabilities : webLimitations,
    downloadEnabled: true,
    shareTargets: ['copy-link', 'whatsapp', 'x', 'instagram']
  });
});

app.post('/api/generate/image', (req, res) => {
  const { prompt = '', mode = 'web' } = req.body;

  if (!prompt.trim()) {
    return res.status(400).json({ error: 'Image prompt is required.' });
  }

  res.json({
    prompt,
    mode,
    queueTimeMs: 1200,
    resultUrl:
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    notice: mode === 'web' ? 'Web uses fast preview quality. Install app for 4K generation.' : '4K generation ready.'
  });
});

app.post('/api/security/scan', (req, res) => {
  const { content = '' } = req.body;
  const suspicious = ['<script', 'eval(', 'rm -rf', 'drop table'];
  const findings = suspicious.filter((word) => content.toLowerCase().includes(word));

  res.json({
    safe: findings.length === 0,
    findings,
    malwareEngine: 'MaDE-iT Shield v1'
  });
});

app.get('/api/plans', (_, res) => {
  res.json({
    free: { price: 0, description: 'All starter features free at launch.' },
    premium: [
      { name: 'Hourly Boost', priceUsd: 1.99 },
      { name: 'Weekly Pro', priceUsd: 9.99 },
      { name: 'Monthly Studio', priceUsd: 24.99 },
      { name: 'Yearly Enterprise', priceUsd: 199 }
    ],
    paymentMethods: ['Card', 'UPI', 'NetBanking', 'PayPal', 'Apple Pay', 'Google Pay', 'Crypto (optional)']
  });
});

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`MaDE-iT running at http://localhost:${port}`);
});
