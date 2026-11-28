const fs = require("node:fs");
const path = require("node:path");

exports.default = async function afterPackHook(context) {
  const appOutDir = context.appOutDir;
  console.log(`[afterPack] Menyalin node_modules standalone ke dalam output: ${appOutDir}`);
  
  const srcNodeModules = path.resolve(__dirname, "..", "apps", ".next", "standalone", "node_modules");
  const dstNodeModules = path.join(appOutDir, "resources", "standalone", "node_modules");

  if (fs.existsSync(srcNodeModules)) {
    console.log(`[afterPack] Menyalin ${srcNodeModules} -> ${dstNodeModules}`);
    fs.cpSync(srcNodeModules, dstNodeModules, { recursive: true });
    console.log(`[afterPack] Berhasil menyalin node_modules standalone.`);
  } else {
    console.warn(`[afterPack] Peringatan: ${srcNodeModules} tidak ditemukan!`);
  }
};
