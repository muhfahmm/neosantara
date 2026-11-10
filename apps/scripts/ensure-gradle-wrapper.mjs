import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

function findGradleWrapperJar(startDir) {
  const stack = [startDir];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    const entries = readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolutePath);
        continue;
      }

      if (entry.name === "gradle-wrapper.jar") {
        return absolutePath;
      }
    }
  }

  return null;
}

export async function ensureGradleWrapper(androidProjectDir) {
  const wrapperDir = path.join(androidProjectDir, "gradle", "wrapper");
  const wrapperJarPath = path.join(wrapperDir, "gradle-wrapper.jar");

  if (existsSync(wrapperJarPath)) {
    return wrapperJarPath;
  }

  const wrapperPropertiesPath = path.join(wrapperDir, "gradle-wrapper.properties");
  if (!existsSync(wrapperPropertiesPath)) {
    throw new Error(`Gradle wrapper properties not found at ${wrapperPropertiesPath}. Run 'tauri android init' first.`);
  }

  const wrapperProperties = readFileSync(wrapperPropertiesPath, "utf8");
  const distributionLine = wrapperProperties
    .split(/\r?\n/)
    .find((line) => line.startsWith("distributionUrl="));

  if (!distributionLine) {
    throw new Error(`Could not find distributionUrl in ${wrapperPropertiesPath}.`);
  }

  const distributionUrl = distributionLine
    .split("=")
    .slice(1)
    .join("=")
    .replace(/\\:/g, ":");
  const normalizedDistributionUrl = distributionUrl.replace(/(?:-bin|-all)?\.zip$/i, "");
  const versionMatch = /gradle-([0-9][^/]+)$/i.exec(normalizedDistributionUrl);

  if (!versionMatch) {
    throw new Error(`Unsupported Gradle distribution URL: ${distributionUrl}`);
  }

  const gradleVersion = versionMatch[1];
  const zipFilePath = path.join(wrapperDir, `gradle-${gradleVersion}.zip`);
  const tempDir = path.join(wrapperDir, ".gradle-wrapper-download");

  mkdirSync(wrapperDir, { recursive: true });
  const zipResponse = await fetch(distributionUrl);
  if (!zipResponse.ok) {
    throw new Error(`Failed to download Gradle ${gradleVersion} from ${distributionUrl}: ${zipResponse.status} ${zipResponse.statusText}`);
  }

  writeFileSync(zipFilePath, Buffer.from(await zipResponse.arrayBuffer()));
  rmSync(tempDir, { recursive: true, force: true });
  mkdirSync(tempDir, { recursive: true });

  if (process.platform === "win32") {
    execFileSync(
      "powershell",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        `Expand-Archive -LiteralPath '${zipFilePath}' -DestinationPath '${tempDir}' -Force`,
      ],
      { stdio: "inherit" },
    );
  } else {
    execFileSync("unzip", ["-o", zipFilePath, "-d", tempDir], { stdio: "inherit" });
  }

  const extractedJarPath = findGradleWrapperJar(tempDir);
  if (!extractedJarPath) {
    throw new Error(`Could not extract gradle-wrapper.jar from ${distributionUrl}.`);
  }

  writeFileSync(wrapperJarPath, readFileSync(extractedJarPath));
  rmSync(tempDir, { recursive: true, force: true });
  rmSync(zipFilePath, { force: true });

  console.log(`[Gradle Wrapper] Downloaded and extracted ${path.basename(wrapperJarPath)} for Gradle ${gradleVersion}.`);
  return wrapperJarPath;
}

if (process.argv[1]) {
  const invokedFileUrl = pathToFileURL(path.resolve(process.argv[1])).href;
  if (import.meta.url === invokedFileUrl) {
    const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const androidProjectDir = path.join(appDir, "src-tauri", "gen", "android");

    ensureGradleWrapper(androidProjectDir)
      .then(() => {
        process.exitCode = 0;
      })
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
  }
}
