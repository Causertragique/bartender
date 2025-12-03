import cors from "cors";
import { createServer } from "./index";

const app = createServer();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

// Allow cross-origin requests from the Vite dev server
app.use(cors({ origin: true, credentials: true }));

app.listen(port, () => {
  console.log(`🔌 Backend (dev) running at http://localhost:${port}`);
  console.log(`📡 API base: http://localhost:${port}/api`);
});
