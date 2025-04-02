const fs = require("fs");
const readline = require("readline");
const { exec } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) =>
  new Promise((res) => rl.question(q, (ans) => res(ans || "")));

const run = (cmd, cwd) =>
  new Promise((res, rej) => {
    const child = exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) rej(stderr);
      else res(stdout);
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });

(async () => {
  try {
    console.log("\n🌐 Web Auth Portal Setup Script\n");

    const MONGO_URI = await ask("MongoDB URI:");
    const JWT_SECRET = await ask("JWT Secret: ");
    const CLOUDINARY_NAME = await ask("Cloudinary Cloud Name: ");
    const CLOUDINARY_KEY = await ask("Cloudinary API Key: ");
    const CLOUDINARY_SECRET = await ask("Cloudinary API Secret: ");

    const CLIENT_URL = "http://localhost:5173";

    const env = `
NODE_ENV=development
PORT=5000

MONGO_URI=${MONGO_URI}
JWT_SECRET=${JWT_SECRET}
CLIENT_URL=${CLIENT_URL}

CLOUDINARY_NAME=${CLOUDINARY_NAME}
CLOUDINARY_KEY=${CLOUDINARY_KEY}
CLOUDINARY_SECRET=${CLOUDINARY_SECRET}
    `.trim();

    fs.writeFileSync("./backend/.env", env);
    console.log("✅ Created ./backend/.env");

    const install = await ask("\nInstall backend + frontend dependencies? (y/n): ");
    if (install.toLowerCase() === "y") {
      console.log("\n📦 Installing backend dependencies...");
      await run("npm install", "./backend");

      console.log("\n📦 Installing frontend dependencies...");
      await run("npm install", ".");
    }

    console.log("\n✅ You're set up! Now run:");
    console.log("➡ node server.js (in backend)");
    console.log("➡ npm run dev (in frontend)");

    rl.close();
  } catch (err) {
    console.error("\n❌ Setup failed:", err);
    rl.close();
  }
})();
