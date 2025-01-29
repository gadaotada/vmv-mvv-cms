import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5173;

app.use('/assets', express.static(path.join(__dirname, 'build/client/assets')));
app.use(express.static(path.join(__dirname, 'build/client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/client/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});