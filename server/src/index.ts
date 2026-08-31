import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
const PORT = Number(env.PORT) || 8008;

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 ROADSIDE LOGISTICS API SERVER RUNNING`);
  console.log(`📡 URL: http://localhost:${PORT}/api`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`🏢 Orgs: http://localhost:${PORT}/api/organizations`);
  console.log(`==================================================`);
});
