// import * as Fs from 'fs-extra'
// import * as convert from 'xml-js'
// import { logger } from "./log/logger";

export function prettyNum(num: number) {
  return num < 10 ? `0${num}` : String(num)
}

export function getTimeStamp() {
  const now = new Date()

  const year = String(now.getFullYear())
  const mounth = prettyNum(now.getMonth())
  const day = prettyNum(now.getDate())
  const hour = prettyNum(now.getHours())
  const minute = prettyNum(now.getMinutes())
  const second = prettyNum(now.getSeconds())

  return `${now.getTime()} ${year}-${mounth}-${day} ${hour}:${minute}:${second}`
}

// export function deletePath(deletedPath: string) {
//   if (Fs.existsSync(deletedPath)) {
//     Fs.rmSync(deletedPath, { recursive: true });
//     logger.methodResponse(`tools/utils.ts/deletePath (${deletedPath})`, true);
//   } else {
//     logger.methodResponse(`tools/utils.ts/deletePath (${deletedPath})`, false);
//   }
// }

// export function movePath(oldPath: string, newPath: string) {
//   Fs.moveSync(oldPath, newPath);
//   logger.methodResponse("tools/utils.ts/movePath", `${oldPath} => ${newPath}`);
// }

// export function copyFile(oldPath: string, newPath: string) {
//   Fs.copyFileSync(oldPath, newPath);
//   logger.methodResponse("tools/utils.ts/copyFile", `${oldPath} => ${newPath}`);
// }

// export function createDir(dirPath: string) {
//   if (!Fs.existsSync(dirPath)) {
//     Fs.mkdirSync(dirPath, { recursive: true });

//     logger.methodResponse(`tools/utils.ts/createDir (${dirPath})`, dirPath);
//   } else {
//     logger.methodResponse(`tools/utils.ts/createDir (${dirPath})`, false);
//   }
// }

// export function xml2json(filePath: string) {
//   logger.log({ message: "Parsing " + filePath });

//   try {
//     let rawFile = Fs.readFileSync(filePath).toString();

//     if (rawFile == "") return null;

//     return JSON.parse(convert.xml2json(rawFile, {}));
//   } catch (error) {
//     logger.error({ message: `Fail while parsing ${filePath}:` });
//     logger.error({ message: error + "" });

//     return null;
//   }
// }

export function capitalize(txt: string) {
  return txt.charAt(0).toUpperCase() + txt.slice(1)
}

//  function loadConfig() {
//   // import defaultConfig from './defaultConfig.json';

//   // global projeto
//   // projeto
//   // global

//   return {
//     logs: {path: './logs/apex-copilot', save: false},
//   }
// }


