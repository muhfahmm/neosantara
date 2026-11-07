import { createServer } from "node:net";

function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(false);
      } else {
        reject(error);
      }
    });

    server.listen({ host: "0.0.0.0", port, exclusive: true }, () => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      });
    });
  });
}

async function findFreePort(startPort, endPort = 65535) {
  for (let port = startPort; port <= endPort; port += 1) {
    if (await isPortAvailable(port)) return port;
  }

  throw new Error(`Tidak ada port kosong mulai dari ${startPort}.`);
}

export { findFreePort, isPortAvailable };
