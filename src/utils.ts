import fs from "fs";

export function fileExists(path: string) {
    return fs.existsSync(path);
}

export function isFolder(path: string) {
    try {
        const stats = fs.statSync(path);
        return stats.isDirectory();
    }
    catch(err) {
        return false;
    }
}

export function isEmptyFolder(path: string) {
    try {
        const files = fs.readdirSync(path);
        if (files.length === 0) return true;
    } catch(err) {}
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

export function listFilesInDirectory(path: string) {
    return fs
        .readdirSync(path)
        .map((file) => `${path}/${file}`);
}

export function listDirectoriesInDirectory(path: string) {
    return fs
        .readdirSync(path)
        .map((file) => `${path}/${file}`)
        .filter((file) => isFolder(file));
}

export function getFileCreationTime(path: string) {
    const stats = fs.statSync(path, { bigint: true });
    return stats.birthtimeMs;
}

export function parseArgument(args: string[], parameterKeys: string[]): string | null {
    const paramIndex = args.findIndex(key => parameterKeys.includes(key));
    if(paramIndex !== -1) {
        if(!args[paramIndex + 1] || args[paramIndex + 1].match(/^-+\D+/)){
            return args[paramIndex];
        }

        return args[paramIndex + 1];
    }

    return null;
}

export function generateRandomFileName() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}