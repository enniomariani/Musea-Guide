import {rmSync, existsSync, writeFileSync} from "fs";
import {WebSocketServer} from 'ws';

import {fileURLToPath} from "url";
import {dirname, join} from "path";
import {ConvertNetworkData} from "Musea-Client/renderer";

let wss: WebSocketServer | null = null;
let temporarySavedContentsJSON: string = "";

const filename: string = fileURLToPath(import.meta.url);
const dirNameTests: string = dirname(filename);
const dirNameData: string = join(dirNameTests, "..", "..", "out", "Musea-Guide-win32-x64", "resources", "daten");
const savedMediaStationFilePath: string = join(dirNameData, "savedMediaStations.json");
const savedTempDirMS0: string = join(dirNameData, "0");

export let receivedCommandHistory:(string | Uint8Array)[][] = [];
export let wssExpectedCommands:Map<string, (string | Uint8Array)[]> = new Map();

export function setTemporaryContentJSON(contentJSON:string){
    temporarySavedContentsJSON = contentJSON;
}

/**
 * resets everything and sets up network-answer-calls for a working network-connection:
 * - ping returns pong
 * - registration possible returns true
 * - registration returns accepted
 *
 * adds 1 media-app with the passed ip-address
 *
 * and exits the mediastation: start-state is the mediastation-screen
 *
 */
export async function setupFunctionalMediaStationComunication():Promise<void> {
    temporarySavedContentsJSON = "{}";

    wssExpectedCommands.clear();
    wssExpectedCommands.set("network,ping", ["network", "pong"])
    wssExpectedCommands.set("network,isRegistrationPossible", ["network", "isRegistrationPossible", "yes"])
    wssExpectedCommands.set("network,register,admin", ["network", "registration", "accepted"])

    await initWSS();

    removeAllSavedFiles();

    createAndSaveSavedMediaStationJSON("Medienstation für e2e-Tests", "127.0.0.1");
}

export function createAndSaveSavedMediaStationJSON(nameMediaStation:string, ipController:string):void{
    const json:any = {
        "mediaStations": [
        {
            "name": nameMediaStation,
            "ip": ipController
        }
    ]};

    console.log("Test / write media-station-json: ", ipController, nameMediaStation);

    writeFileSync(savedMediaStationFilePath, JSON.stringify(json));
}

export async function initWSS(): Promise<void> {

    if (wss) {
        wss.close();
        wss = null;
    }

    wss = new WebSocketServer({port: 5000, host: '127.0.0.1'});
    receivedCommandHistory = [];

    wss.on('connection', (ws) => {
        ws.on('message', (data: Buffer) => {
            const dataWithoutChunkInfo: Uint8Array = new Uint8Array(data).slice(2);       //delete the first 2 bytes, because they hold the information in how many chunks the message was sent, which is not important for the tests
            const completeCommand:(string | Uint8Array)[] = ConvertNetworkData.decodeCommand(new Uint8Array(dataWithoutChunkInfo));
            const completeCommandAsStr:string = completeCommand.toString();

            receivedCommandHistory.push(completeCommand);

            console.log("-- Server / received message: ", completeCommandAsStr," answer to that: ", wssExpectedCommands.get(completeCommandAsStr));

            if (wssExpectedCommands.has(completeCommandAsStr)) {
                console.log("-- Server / answer message: ", wssExpectedCommands.get(completeCommandAsStr))
                //send answer to guide-app
                ws.send(ConvertNetworkData.encodeCommand(...wssExpectedCommands.get(completeCommandAsStr) as string[]));
            }

            //if the received command is a content-PUT-command for the contents, save the contents-json to a temporary json
            if (completeCommand.length === 3 && completeCommand[0] === "contents" && completeCommand[1] === "put") {
                temporarySavedContentsJSON = completeCommand[2].toString();
                console.log("-- Server / save contents.json: ", temporarySavedContentsJSON)
                //if the received command is a content-GET-command for the contents, send the saved contents-json
            } else if (completeCommand.length === 2 && completeCommand[0] === "contents" && completeCommand[1] === "get") {
                console.log("-- Server / send contents.json: ", temporarySavedContentsJSON)
                ws.send(ConvertNetworkData.encodeCommand("contents", "put", temporarySavedContentsJSON));
            }
        });
    });
}

export function removeAllSavedFiles() {

    console.log("-- REMOVE OLD FILES: ", savedMediaStationFilePath, existsSync(savedMediaStationFilePath))

    if (existsSync(savedMediaStationFilePath)) {
        console.log("--- savedMediaStation-JSON exists,  Delete: ", savedMediaStationFilePath);
        rmSync(savedMediaStationFilePath, {force: true});
    }

    if (existsSync(savedTempDirMS0)) {
        console.log("--- temporary saved MS exists for MS 0,  Delete: ", savedTempDirMS0);
        rmSync(savedTempDirMS0, {force: true, recursive: true});
    }
}