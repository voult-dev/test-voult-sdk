import './loadEnv.js';
import createApp from './app.js';

const app = createApp();

const PORT= process.env.PORT;

app.listen(PORT, () => {
  console.log(`Voult playground Backend is running on http://localhost:${PORT}`);
});
