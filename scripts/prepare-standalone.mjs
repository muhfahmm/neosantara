import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const appsDir = path.join(rootDir, "apps");
const standaloneDir = path.join(appsDir, ".next", "standalone");
const bundleDir = path.join(rootDir, "standalone-bundle");

const targetAppDir = existsSync(path.join(standaloneDir, "apps", "server.js"))
  ? path.join(standaloneDir, "apps")
  : path.join(standaloneDir, "neosantara", "apps");

console.log("Menggunakan target standalone apps:", targetAppDir);

// 1. Salin apps/public
const publicSrc = path.join(appsDir, "public");
const publicDst = path.join(targetAppDir, "public");
if (existsSync(publicSrc)) {
  console.log(`Menyalin ${publicSrc} -> ${publicDst}`);
  cpSync(publicSrc, publicDst, { recursive: true });
}

// 2. Salin apps/.next/static
const staticSrc = path.join(appsDir, ".next", "static");
const staticDst = path.join(targetAppDir, ".next", "static");
if (existsSync(staticSrc)) {
  console.log(`Menyalin ${staticSrc} -> ${staticDst}`);
  cpSync(staticSrc, staticDst, { recursive: true });
}

// 3. Salin data/ (database SQLite master)
const dataSrc = path.join(rootDir, "data");
const dataDst = path.join(standaloneDir, "data");
if (existsSync(dataSrc)) {
  console.log(`Menyalin ${dataSrc} -> ${dataDst}`);
  cpSync(dataSrc, dataDst, { recursive: true });
}

// 4. Salin environment (.env dan .env.local)
const envLocalSrc = path.join(appsDir, ".env.local");
const envLocalDst = path.join(targetAppDir, ".env.local");
if (existsSync(envLocalSrc)) {
  cpSync(envLocalSrc, envLocalDst);
}

const envRootSrc = path.join(rootDir, ".env");
const envRootDst = path.join(standaloneDir, ".env");
if (existsSync(envRootSrc)) {
  cpSync(envRootSrc, envRootDst);
}

// 5. Salin favicon resmi ke root icon
const faviconSrc = path.join(appsDir, "src", "app", "favicon.ico");
const iconDst = path.join(rootDir, "app-icon.ico");
if (existsSync(faviconSrc)) {
  cpSync(faviconSrc, iconDst);
}

// 6. Buat bundle di standalone-bundle (di luar folder .next agar tidak diabaikan electron-builder)
console.log(`Menyalin ${standaloneDir} -> ${bundleDir}`);
cpSync(standaloneDir, bundleDir, { recursive: true });

console.log("Persiapan standalone Next.js selesai.");
