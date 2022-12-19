import { createFile, createFolder, fileExists, generateRandomFileName, getFileContent, getFileCreationTime, isFolder, listDirectoriesInDirectory, listFilesInDirectory, parseArgument, setFilePermissions } from "./utils";
import nodepath from "path";

const nameOfRootFolder = "find-willa";
const nameOfConfigFile = ".willa-config";
const dirNames = getFileContent(nodepath.join(__dirname, "..", "assets/dir-names.txt")).split("\n");
const fileNames = getFileContent(nodepath.join(__dirname, "..", "assets/file-names.txt")).split("\n");
const numberOfStrategies = 4;

// which hiding strategy is used when the script is run
let hidingStrategy = Math.floor(Math.random() * numberOfStrategies);
// how complex the dummy filesystem is
let complexityLevel = 1.3;
// how deep the dummy filesystem can be nested
let maxNestLevel = 5;
// minimum folders per directory
let minimumFolders = 1;
// minimum files per directory
let minimumFilesPerFolder = 2;

// start the game
function main() {
    let args = process.argv.slice(2);

    // resolve arguments
    if(parseArgument(args, ["--help", "-h"])) {
        printHelp();
        return process.exit(0);
    }

    complexityLevel = Number(parseArgument(args, ["--complexity-level", "-c"]) || complexityLevel);
    maxNestLevel = Number(parseArgument(args, ["--max-nest-level", "-n"]) || maxNestLevel);
    minimumFolders = Number(parseArgument(args, ["--minimum-folders", "-f"]) || minimumFolders);
    minimumFilesPerFolder = Number(parseArgument(args, ["--minimum-files-per-folder", "-m"]) || minimumFilesPerFolder);
    hidingStrategy = Number(parseArgument(args, ["--strategy", "-s"]) || hidingStrategy);
    if(Number.isNaN(hidingStrategy)) hidingStrategy = Math.floor(Math.random() * numberOfStrategies);

    let startPath = process.cwd();
    if(args.reverse()[0] && !args.reverse()[0].match(/^-+\D+/)) startPath = nodepath.resolve(args.reverse()[0]);

    // check if starting a new game or submitting an answer
    // check is done based on provided path
    // if the path is a file, the answer is submitted 
    if(!isFolder(startPath)) {
        const [correct, startTime] = submitAnswer(startPath);
        
        if(correct) console.log(`Congratulations! You've found Willa! :)\nIt took you: ${(Date.now() - Number(startTime)) / 1000} sec.\n`);
        else console.log("Sorry, that's not Willa. :(\nKeep looking!\n");
        
        return process.exit(0);
    }
    
    // if the path is a folder, a new game is started
    initGame(startPath);
}

// check if the provided path is the same as the path to Willa
function submitAnswer(path: string): [boolean, bigint] {
    const willaConfigPath = nodepath.resolve(path).match(/.*\/find-willa/)?.[0];
    const willaCurrentPath = getFileContent(`${willaConfigPath}/${nameOfConfigFile}`).split("\n")[2];
    if(!willaCurrentPath) {
        console.error("A game in progress was not found. :(\n");
        return process.exit(1);
    }

    // provide the creation time of the config file to calculate the time it took to find Willa
    const creationTime = getFileCreationTime(`${willaConfigPath}/${nameOfConfigFile}`);

    return willaCurrentPath === path ? [true, creationTime] : [false, creationTime];
}

// initialize a new game
function initGame(path: string) {
    const rootPath = `${path}/${nameOfRootFolder}`;

    // check if a game is already in progress
    // could be better
    if(fileExists(rootPath)) {
        console.log("A game is already in progress. :(");
        console.log(`Finish it, delete the entire folder '${nameOfRootFolder}' and try again.\n`);
        return process.exit(1);
    }

    // create the root folder
    createFolder(rootPath);
    // create the config file
    
    generateDummyFileStructure(rootPath);
    const willaLocation = createWillaFile(rootPath);
    createFile(rootPath, nameOfConfigFile, `This file contains configuration for the current instance of the Find-Willa game.\nThis file is never Willa herself.\n${willaLocation}`);
    //appendToFile(`${rootPath}/${nameOfConfigFile}`, `\n${willaLocation}`);

    console.log(`The game has started. Willa should be hiding somewhere in the '${nameOfRootFolder}' folder.\n`);
}

// generate dummy file structure based on provided file names, dir names and script arguments
function generateDummyFileStructure(path: string, nestLevel = 0) {
    const dirPaths = [];
    //generate folders
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

    //generate files
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

    // decide if the next level of nesting should be generated
    for(const dir of dirPaths) {
        if(nestLevel < maxNestLevel)
            generateDummyFileStructure(dir, ++nestLevel);
    }
}

// create Willa file based on decided strategy
function createWillaFile(rootPath: string) {
    const willaLocation = findRandomLocationInPath(rootPath);
    let willaName = "Willa";
    let willaContent = "";
    let willaPermissions = undefined;

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

// find a random file path in the provided directory
function findRandomLocationInPath(path: string): string {
    const directories = listDirectoriesInDirectory(path);
    let randomFilePath = directories[Math.floor(Math.random() * directories.length)];

    if(!randomFilePath) return path;
    if(Math.random() > 0.7) return randomFilePath;
    else return findRandomLocationInPath(randomFilePath);
}

// print help message
function printHelp() {
    console.log("You can call this script in the following ways (all paths can be relative):");
    console.log("To start a new game:\n\t./find-willa [path]");
    console.log("If no path is specified, the current working directory is used.\n");
    console.log("To submit an answer:\n\t./find-willa [path-to-Willa]\n");
    console.log("Options:");
    console.log("-h, --help\t\t\tPrints this help message.");
    console.log("-s, --hiding-strategy\t\tSets the hiding strategy of the game. 0 = default, 1 = reverse, 2 = content, 3 = permissions. Default: random");
    console.log(`-c, --complexity-level\t\tSets the complexity level of the game. The higher the number, the more files and folders will be generated. Default: ${complexityLevel}`);
    console.log(`-n, --max-nest-level\t\tSets the maximum nesting level of the game. The higher the number, the more folders will be generated. Default: ${maxNestLevel}`);
    console.log(`-f, --minimum-folders\t\tSets the minimum number of folders that will be generated. Default: ${minimumFolders}`);
    console.log(`-m, --minimum-files-per-folder\tSets the minimum number of files that will be generated per folder. Default: ${minimumFilesPerFolder}\n`);
}

main();
