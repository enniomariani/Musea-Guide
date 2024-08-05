import {
    ContentDownloadStatus,
    IContentDownloadResult,
    IMediaPlayerData,
    ProgressReporter
} from "musea-client/renderer";
import {ModelMain} from "renderer/models/ModelMain.js";

export interface IViewMediastation {
    id: number,
    title: string,
    status: boolean
}

export enum DownloadContentsStatus {
    Success = 'success',
    NoContentsOnController = 'noContentsOnController',
    NoControllerIp = 'noControllerIp',
    NoResponseFromController = 'noResponseFromController',
    Other = 'other'
}

export type DownloadContentsResult = {
    status: DownloadContentsStatus
    params?: { ip?: string; mediaStationId?: number; raw?: string }
}

export class MediaStationPresenter {
    private _modelMain: ModelMain;

    constructor(modelMain: ModelMain) {
        this._modelMain = modelMain;
    }

    async loadSavedMediaStations(): Promise<IViewMediastation[]> {
        const loadedMediaStationMetaData:Map<string, string> = await this._modelMain.museaClient.mediaStationService.loadMediaStations();
        const mediaStations: IViewMediastation[] = [];

        let stationId:number = 0;

        loadedMediaStationMetaData.forEach((controllerIp: string, stationName: string) => {
            mediaStations.push({id: stationId, title: stationName, status: false});
            stationId++;
        });

        return mediaStations;
    }

    async checkOnlineStatusOfAllMediaPlayers(mediaStationId: number): Promise<boolean> {
        return await this._modelMain.museaClient.mediaPlayerConnectionService.checkOnlineStatusOfAllMediaPlayers(mediaStationId);
    }

    getName(mediaStationId: number): string {
        return this._modelMain.museaClient.mediaStationService.getMediaStationName(mediaStationId);
    }

    async downloadContents(mediaStationId: number): Promise<DownloadContentsResult> {
        let answer: IContentDownloadResult = await this._modelMain.museaClient.mediaStationService.downloadContents(mediaStationId, false);
        let ip: string | null = this._modelMain.museaClient.mediaStationService.getControllerIp(mediaStationId);
        let answerForView: DownloadContentsResult;

        if (!ip) {
            answerForView = {status: DownloadContentsStatus.NoControllerIp};
            return answerForView;
        }

        switch (answer.status) {
            case    ContentDownloadStatus.Success:
                answerForView = {status: DownloadContentsStatus.Success};
                break;
            case    ContentDownloadStatus.SuccessNoContentsOnController:
                answerForView = {status: DownloadContentsStatus.NoContentsOnController};
                break;
            case ContentDownloadStatus.FailedNoControllerIp:
                answerForView = {status: DownloadContentsStatus.NoControllerIp};
                break;
            case ContentDownloadStatus.FailedNoResponseFrom:
                answerForView = {status: DownloadContentsStatus.NoResponseFromController,
                params: {ip: ip}};
                break;
            default:
                answerForView = {status: DownloadContentsStatus.Other,
                    params: {raw: answer.status.toString()}};
                break;
        }

        return answerForView;
    }

    async connnectAndRegisterAllMediaPlayers(mediaStationId: number):Promise<void>{
        let allMediaPlayers:Map<number, IMediaPlayerData> = this._modelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers(mediaStationId);

        for (let [key, mediaPlayerData] of allMediaPlayers)
            await this._modelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer(mediaStationId, key);
    }

    async unregisterAndCloseAllMediaPlayers(mediaStationId: number): Promise<void> {
        let allMediaPlayers: Map<number, IMediaPlayerData> = this._modelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers(mediaStationId);

        for (let [key, mediaPlayerData] of allMediaPlayers)
            await this._modelMain.museaClient.mediaPlayerConnectionService.unregisterAndCloseMediaPlayer(mediaStationId, key);
    }

    async sync(mediaStationId:number, progressReporter:ProgressReporter):Promise<boolean>{
        return await this._modelMain.museaClient.mediaStationService.syncMediaStation(mediaStationId, progressReporter);
    }
}