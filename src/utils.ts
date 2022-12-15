import fs from "fs";

export function fileExists(path: string) {
    return fs.existsSync(path);
}

export function isFolder(path: string) {
    const stats = fs.statSync(path);
    return stats.isDirectory();
}

export function isEmptyFolder(path: string) {
    const files = fs.readdirSync(path);
    if (files.length === 0) return true;
    return false;
}

export function getFilePermissions(path: string) {
    const stats = fs.statSync(path);
    return stats.mode;
}

export function getFileContent(path: string) {
    return fs.readFileSync(path, "utf-8");
}

export function setFilePermissions(path: string, permissions: number) {
    fs.chmodSync(path, permissions);
}

export function createFolder(path: string, name?: string) {
    if(name) path = `${path}/${name}`;
    fs.mkdirSync(path);
    return path;
}

export function createFile(path: string, name?: string, content?: string, permissions?: number) {
    if(name) path = `${path}/${name}`;
    if(!content) fs.writeFileSync(path, "");
    else fs.writeFileSync(path, content);

    if(permissions) setFilePermissions(path, permissions);
    return path;
}

export function appendToFile(path: string, content: string) {
    fs.appendFileSync(path, content);
}

export function listDirectory(path: string) {
    return fs
        .readdirSync(path)
        .filter((file) => !file.startsWith("."))
        .map((file) => `${path}/${file}`);
}

export function getFileCreationTime(path: string) {
    const stats = fs.statSync(path, { bigint: true });
    return stats.birthtimeMs;
}