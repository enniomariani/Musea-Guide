import {CreateGlobalSettings} from "renderer/models/globalSettings/CreateGlobalSettings.js";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings.js";
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import {FolderPresenter} from "renderer/presenters/FolderPresenter.js";
import {PlaybackData} from "renderer/models/PlaybackData.js";
import {InputTimeoutHandler} from "renderer/presenters/handlers/InputTimeoutHandler.js";
import {TagPresenter} from "renderer/presenters/TagPresenter.js";
import {App, createApp} from "vue";
import AppRoot from "renderer/views/AppRoot.vue";
import {i18n} from "renderer/views/Texts";
import {PlaybackPresenter} from "renderer/presenters/PlaybackPresenter.js";
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";
import {loadTheme} from "renderer/Theme.js";
import {ModelMain} from "renderer/models/ModelMain.js";

import {version} from "../../package.json";

export class MainApp {
    static INPUT_TIMEOUT_SEC: number = 60 * 60;

    private _modelMain: ModelMain;

    private _mediaStationPresenter: MediaStationPresenter;
    private _folderPresenter: FolderPresenter;
    private _tagPresenter: TagPresenter;
    private _playbackPresenter: PlaybackPresenter;
    private _inactivityPresenter: InactivityPresenter;

    private _vueApp: App;

    private _inputTimeoutHandler: InputTimeoutHandler;

    constructor() {
        this._modelMain = new ModelMain(new CreateGlobalSettings(new GlobalSettings(), window.backend), new GlobalSettings())

        this._inputTimeoutHandler = new InputTimeoutHandler();

        this._mediaStationPresenter = new MediaStationPresenter(this._modelMain);
        this._folderPresenter = new FolderPresenter(this._modelMain);
        this._playbackPresenter = new PlaybackPresenter(this._modelMain, new PlaybackData(), this._inputTimeoutHandler);
        this._tagPresenter = new TagPresenter(this._modelMain);
        this._inactivityPresenter = new InactivityPresenter(this._inputTimeoutHandler);

        this._vueApp = createApp(AppRoot, {
            mediaStationPresenter: this._mediaStationPresenter,
            folderPresenter: this._folderPresenter,
            playbackPresenter: this._playbackPresenter,
            tagPresenter: this._tagPresenter,
            inactivityPresenter: this._inactivityPresenter,

            version: version,
            inputTimeoutSec: MainApp.INPUT_TIMEOUT_SEC
        });
    }

    async start() {
        await loadTheme();

        await this._modelMain.loadSettings();
        await this._modelMain.initFrameWork();

        this._vueApp.use(i18n).mount(document.body);
    }
}