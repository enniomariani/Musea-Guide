import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
    legacy: false,
    locale: 'de',
    fallbackLocale: 'de',
    messages: {
        de: {
            appName: 'Musea Guide',

            alertBlockMediastation: 'Achtung: Die Medienstation wird für Besuchende gesperrt.',
            infoCheckOnlineStateOfMediaStations: 'Überprüfe Status der Medienstationen...',
            checkConnectionToController: 'Überprüfe Verbindung zum Controller...\n\n',
            checkMediaStation: '\n\nÜberprüfe Medienstation ',
            mediaStationReachable: '- Medienstation erreichbar',
            mediaStationNotReachable: '- Medienstation nicht erreichbar',

            download: {
                success: "Die Inhalte wurden erfolgreich heruntergeladen.",
                noContentsOnController: "Es sind noch keine Inhalte auf dem Controller.",
                noControllerIp: "Es ist kein Controller definiert.",
                noResponseFromController: "Der Controller kann nicht erreicht werden: ",
                other: "Unbekannte Antwort."
            },

            reallyCloseMediastation: 'Die Medienstation verlassen und freigeben?',

            btnFadeOut: 'Fade out',
            btnEndAndFree: 'Beenden & Freigeben',
            btnAbort: 'Abbrechen',
            btnSave: 'Speichern',
            btnNo: 'Nein',
            btnYes: 'Ja',
            btnDelete: 'Löschen',
            btnContinue: 'Fortfahren',

            defaultTextSearch: 'Suchen',
            modusContents: 'Contents',
            modusTags: 'Tags',

            openTagAdminBtn: 'Tag hinzufügen',

            btnTitleTagAdmin: 'Tags',
            btnDeleteTags: 'Tags löschen',
            createTag: 'Tag erstellen',
            btnAddNewTag: 'Neuen Tag hinzufügen',
            defaultTxtSearchTag: 'Tag suchen',
            placeHolderInsertTagName: 'Name des Tags eingeben',
            reallyWantToDeleteTag: 'Tag(s) wirklich löschen? Der/die Tags sind eventuell auch anderen Contents zugeordnet!',
            reallyWantToRemoveTagFromContent: 'Tag wirklich vom Content entfernen? (Tag wird nicht gelöscht)',

            mediaStationTimeOutPartOne: 'Länger als ',
            mediaStationTimeOutPartTwo: ' Minuten keine Eingabe, Medienstation wird beendet und freigegeben.',
        }
    }
})