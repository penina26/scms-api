import jsonServer from "json-server";
import cors from "cors";
import fs from "fs";
import path from "path";

const server = jsonServer.create();
server.use(cors());
server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// If a Railway Volume is attached, Railway exposes its mount path in env vars
const mountPath = process.env.RAILWAY_VOLUME_MOUNT_PATH; // e.g. /data :contentReference[oaicite:0]{index=0}
const seedFile = path.join(process.cwd(), "db.json");

// We'll store the live db.json on the volume so changes persist
const dbFile = mountPath ? path.join(mountPath, "db.json") : seedFile;

// If using a volume and db doesn't exist yet, seed it from repo db.json once
if (mountPath && !fs.existsSync(dbFile)) {
    fs.mkdirSync(mountPath, { recursive: true });
    fs.copyFileSync(seedFile, dbFile);
}

const router = jsonServer.router(dbFile);
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`SCMS API running on port ${PORT}`);
});
