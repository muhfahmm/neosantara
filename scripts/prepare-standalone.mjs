import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const appsDir = path.join(rootDir, "apps");

const standaloneDir = path.join(appsDir, ".next", "standalone", "neosantara");
const targetAppDir = path.join(standaloneDir, "apps");

// 1. Salin apps/public ke standalone apps/public
const publicSrc = path.join(appsDir, "public");
const publicDst = path.join(targetAppDir, "public");
if (existsSync(publicSrc)) {
  console.log(`Menyalin ${publicSrc} -> ${publicDst}`);
  cpSync(publicSrc, publicDst, { recursive: true });
}

// 2. Salin apps/.next/static ke standalone apps/.next/static
const staticSrc = path.join(appsDir, ".next", "static");
const staticDst = path.join(targetAppDir, ".next", "static");
if (existsSync(staticSrc)) {
  console.log(`Menyalin ${staticSrc} -> ${staticDst}`);
  cpSync(staticSrc, staticDst, { recursive: true });
}

// 3. Salin file environment (.env dan .env.local)
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

// 4. Salin node_modules standalone ke apps/node_modules agar selalu ikut ter-package
const standaloneNmSrc = path.join(standaloneDir, "node_modules");
const standaloneNmDst = path.join(targetAppDir, "node_modules");
if (existsSync(standaloneNmSrc)) {
  console.log(`Menyalin ${standaloneNmSrc} -> ${standaloneNmDst}`);
  cpSync(standaloneNmSrc, standaloneNmDst, { recursive: true });
}

// 5. Salin favicon resmi ke assets icon
const faviconSrc = path.join(appsDir, "src", "app", "favicon.ico");
const iconDst = path.join(rootDir, "app-icon.ico");
if (existsSync(faviconSrc)) {
  cpSync(faviconSrc, iconDst);
}

console.log("Persiapan standalone Next.js selesai.");
