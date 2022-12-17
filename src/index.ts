import { appendToFile, createFile, createFolder, fileExists, generateRandomFileName, getFileContent, getFileCreationTime, isFolder, listFilesInDirectory, parseParameter, setFilePermissions } from "./utils";
import nodepath from "path";

const nameOfRootFolder = "find-willa";
const nameOfConfigFile = ".willa-config";
const dirNames = getFileContent(nodepath.join(__dirname, "..", "assets/dir-names.txt")).split("\n");
const fileNames = getFileContent(nodepath.join(__dirname, "..", "assets/file-names.txt")).split("\n");
const numberOfStrategies = 4;

let hidingStrategy = Math.floor(Math.random() * numberOfStrategies);
let complexityLevel = 1.3;
let maxNestLevel = 5;
let minimumFolders = 1;
let minimumFilesPerFolder = 2;

function main() {
    let args = process.argv.slice(2);

    if(parseParameter(args, ["--help", "-h"])) {
        printHelp();
        return process.exit(0);
    }
    
    complexityLevel = Number(parseParameter(args, ["--complexity-level", "-c"]) || complexityLevel);
    maxNestLevel = Number(parseParameter(args, ["--max-nest-level", "-n"]) || maxNestLevel);
    minimumFolders = Number(parseParameter(args, ["--minimum-folders", "-f"]) || minimumFolders);
    minimumFilesPerFolder = Number(parseParameter(args, ["--minimum-files-per-folder", "-m"]) || minimumFilesPerFolder);
    hidingStrategy = Number(parseParameter(args, ["--strategy", "-s"]) || hidingStrategy);
    if(Number.isNaN(hidingStrategy)) hidingStrategy = Math.floor(Math.random() * numberOfStrategies);

    let startPath = process.cwd();
    if(!args.reverse()[0].includes("-")) startPath = nodepath.resolve(startPath);

    if(!isFolder(startPath)) {
        const [correct, startTime] = submitAnswer(startPath);

        if(correct) console.log(`Congratulations! You've found Willa! :)\nIt took you: ${(Date.now() - Number(startTime)) / 1000} sec.\n`);
        else console.log("Sorry, that's not Willa. :(\nKeep looking!\n");

        return process.exit(0);
    }

    initGame(startPath);
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
        const randomIndex = Math.floor(Math.random() * dirNames.length);
        let dirName = dirNames[randomIndex];
        if(!dirName) dirName = generateRandomFileName();
        if(fileExists(`${path}/${dirName}`)) {
            i--;
            continue;
        }
        dirPaths.push(createFolder(path, dirName));
        dirNames.splice(randomIndex, 1);
    }

    for(let i = 0; i < Math.round(complexityLevel * Math.random() * 5) + minimumFilesPerFolder; i++) {
        const randomIndex = Math.floor(Math.random() * fileNames.length);
        let fileName = fileNames[randomIndex];
        if(!fileName) fileName = generateRandomFileName();
        if(fileExists(`${path}/${fileName}`)) {
            i--;
            continue;
        }
        fileNames.splice(randomIndex, 1);
        createFile(path, fileName);
    }

    for(const dir of dirPaths) {
        if(dirNames.length > 0 && fileNames.length > 0 && complexityLevel * Math.random() > 0.8 && nestLevel < maxNestLevel)
            generateDummyFileStructure(dir, nestLevel++);
    }
}

function createWillaFile(rootPath: string) {
    const willaLocation = findRandomLocationInPath(rootPath);
    let willaName = "Willa";
    let willaContent = "";
    let willaPermissions = 0o644;

    if(hidingStrategy === 1) {
        willaName = willaName.split("").reverse().join("");
    } else if (hidingStrategy === 2) {
        willaName = fileNames[Math.floor(Math.random() * fileNames.length)];
        if(!willaName) willaName = generateRandomFileName();
        else willaContent = "Hi, it's me, Willa :)";
    } else {
        willaName = fileNames[Math.floor(Math.random() * fileNames.length)];
        if(!willaName) willaName = generateRandomFileName();
        else willaPermissions = 0o020;
    }

    createFile(willaLocation, willaName, willaContent, willaPermissions);

    return `${willaLocation}/${willaName}`;
}

function findRandomLocationInPath(path: string): string {
    const files = listFilesInDirectory(path);
    let randomFilePath = files[Math.floor(Math.random() * files.length)];

    if(randomFilePath && isFolder(randomFilePath)) return findRandomLocationInPath(randomFilePath);
    randomFilePath = randomFilePath ? randomFilePath.split("/").slice(0, -1).join("/") : path;
    
    return randomFilePath;
}

function printHelp() {
    console.log("You can call this script in the following ways (all paths can be relative):");
    console.log("To start a new game:\n\t./find-willa [path]");
    console.log("If no path is specified, the current working directory is used.\n");
    console.log("To submit an answer:\n\t./find-willa [path-to-Willa]\n");
    console.log("Options:");
    console.log("-h, --help\t\t\tPrints this help message.");
    console.log("-s, --hiding-strategy\t\tSets the hiding strategy of the game. 0 = default, 1 = reverse, 2 = content, 3 = permissions. Default: random");
    console.log("-c, --complexity-level\t\tSets the complexity level of the game. The higher the number, the more files and folders will be generated. Default: 1.3");
    console.log("-n, --max-nest-level\t\tSets the maximum nesting level of the game. The higher the number, the more folders will be generated. Default: 5");
    console.log("-f, --minimum-folders\t\tSets the minimum number of folders that will be generated. Default: 1");
    console.log("-m, --minimum-files-per-folder\tSets the minimum number of files that will be generated per folder. Default: 2\n");
}

main();
