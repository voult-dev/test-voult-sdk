import './loadEnv.js';
import createApp from './app.js';

const app = createApp();
const PORT = Number(process.env.PORT || process.env.port || 2000);

app.listen(PORT, () => {
  console.log(`Voult playground BFF running on http://localhost:${PORT}`);
});
