import { appendToFile, createFile, createFolder, fileExists, getFileContent, getFileCreationTime, isFolder, listDirectory } from "./utils";
import nodepath from "path";

const fileNames = [
    "README.md","LICENSE","gcc","g++","clang","clang++","make","cmake","ninja","meson","rustc","cargo","python","python3","pip","pip3","node","npm","yarn","go","gofmt","golint","gopls","golangci-lint","mawk","awk","sed","grep","git","git-lfs","git-annex","git-crypt","git-secret","git-subrepo","git-subtree","git-imerge","git-remote-hg","git-remote-bzr","git-remote-svn","git-remote-gcrypt","vi","vim","nvim","emacs","nano","kak","kakoune","tmux","screen","htop","top","ps","pstree","kill","killall","find","locate","fd","rg","secret.txt","secret","password.txt","test.txt","index.js","index.ts","index.py","index.rb","index.php","index.html","index.css","index.scss","index.sass","index.less","index.c","index.cpp","index.rs","index.go","index.sh","access.log","error.log","debug.log","log.txt","tmp.txt","lang.en.yml","lang.en.json","smile-faces.txt","docs.md","whytho.txt","samplefile","teatime","testfile","test","ambush","asdf","asdf.txt",
];

const dirNames = [
    "var","log","tmp","bin","lib","lib64","lib32","libexec","include","share","src","build","dist","distro","distros","distrobuild","local","etc","config","configs","conf","cfg","cfgs","conf.d","config.d","configs.d","cache","backup","backups","media","music","pictures","photos","videos","docs","sys","system","sysroot","root","home","users","usr","mnt","run","opt","dev","proc","boot","snap","snapshots","srv","www","docker","dockerfiles","git","git-projects","asdf","games","vscode","vscode-extensions","extensions","settings","sbin","spool"
];

const nameOfRootFolder = "find-willa";
const nameOfConfigFile = ".willa-config";
const complexityLevel = 1.3;
const maxNestLevel = 5;
const minimumFolders = 1;
const minimumFilesPerFolder = 2;

function main() {
    let arg = process.argv[2];

    if(arg === "--help" || arg === "-h") {
        printHelp();
        return process.exit(0);
    }

    if(!arg) arg = process.cwd();
    else arg = nodepath.resolve(arg);

    if(!isFolder(arg)) {
        const [correct, startTime] = submitAnswer(arg);

        if(correct) console.log(`Congratulations! You've found Willa! :)\nIt took you: ${(Date.now() - Number(startTime)) / 1000} sec.\n`);
        else console.log("Sorry, that's not Willa. :(\nKeep looking!\n");

        return process.exit(0);
    }

    initGame(arg);
}

function submitAnswer(path: string): [boolean, bigint] {
    const willaConfigPath = nodepath.resolve(path).match(/.*\/find-willa/)?.[0];
    const willaCurrentPath = getFileContent(`${willaConfigPath}/${nameOfConfigFile}`).split("\n")[2];
    if(!willaCurrentPath) {
        console.error("A game in progress was not found. :(\n");
        return process.exit(1);
    }

    const creationTime = getFileCreationTime(`${willaConfigPath}/${nameOfConfigFile}`);

    return willaCurrentPath === path ? [true, creationTime] : [false, creationTime];
}

function initGame(path: string) {
    const rootPath = `${path}/${nameOfRootFolder}`;

    if(fileExists(rootPath)) {
        console.log("A game is already in progress. :(");
        console.log(`Finish it, delete the entire folder '${nameOfRootFolder}' and try again.\n`);
        return process.exit(1);
    }

    createFolder(rootPath);
    createFile(rootPath, nameOfConfigFile, "This file contains configuration for the current instance of the Find-Willa game.\nThis file is never Willa herself.");

    generateDummyFileStructure(rootPath);
    const willaLocation = createWillaFile(rootPath);
    appendToFile(`${rootPath}/${nameOfConfigFile}`, `\n${willaLocation}`);

    console.log(`The game has started. Willa should be hiding somewhere in the '${nameOfRootFolder}' folder.\n`);
}

function generateDummyFileStructure(path: string, nestLevel = 0) {
    const dirPaths = [];
    for(let i = 0; i < Math.round(complexityLevel * Math.random() * 5) + minimumFolders; i++) {
        const dirName = dirNames[Math.floor(Math.random() * dirNames.length)];
        if(fileExists(`${path}/${dirName}`)) {
            i--;
            continue;
        }
        dirPaths.push(createFolder(path, dirName));
    }

    for(let i = 0; i < Math.round(complexityLevel * Math.random() * 5) + minimumFilesPerFolder; i++) {
        const fileName = fileNames[Math.floor(Math.random() * fileNames.length)];
        if(fileExists(`${path}/${fileName}`)) {
            i--;
            continue;
        }
        createFile(path, fileName);
    }

    for(const dir of dirPaths) {
        if(complexityLevel * Math.random() > 0.8 && nestLevel < maxNestLevel)
            generateDummyFileStructure(dir, nestLevel++);
    }
}

function createWillaFile(rootPath: string) {
    const willaLocation = findRandomLocationInPath(rootPath);
    createFile(willaLocation, "Willa");

    return `${willaLocation}/Willa`;
}

function findRandomLocationInPath(path: string): string {
    const files = listDirectory(path);
    let randomFilePath = files[Math.floor(Math.random() * files.length)];

    if(randomFilePath) {
        if(isFolder(randomFilePath)) return findRandomLocationInPath(randomFilePath);
    }
    randomFilePath = randomFilePath ? randomFilePath.split("/").slice(0, -1).join("/") : path;
    
    return randomFilePath;
}

function printHelp() {
    console.log("You can call this script in the following ways (all paths can be relative):");
    console.log("To start a new game:\n\t./find-willa [path]");
    console.log("If no path is specified, the current working directory is used.\n");
    console.log("To submit an answer:\n\t./find-willa [path-to-Willa]\n");
}

main();
