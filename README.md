# Musea-Guide
Zeigt Medien in einer Ordnerstruktur und steuert verschiedene [Musea](https://github.com/enniomariani/Musea)-Medienstationen.

## Schnellstart
1. [Programm herunterladen](https://github.com/enniomariani/Musea-Guide/releases)
1. Die Datei `daten/savedMediaStations.json` mit einem Texteditor öffnen
1. Bestehende Medienstationen hinzufügen. Der Name wird bei der ersten erfolgreichen Verbindung mit der Medienstation überschrieben. Es muss die IP-Adresse des Medien Players mit der Rolle "Controller" angegeben werden.
   
    **Beispiel 1 Medienstation**
   
    ```
   {
     "mediaStations": [
                 {"name": "medienstation 1", "ip": "192.168.1.20"}
           ]
   }
   ```
   **Beispiel 2 Medienstationen**

   ```
   {
     "mediaStations": [
                {"name": "medienstation 1", "ip": "192.168.1.20"},
                {"name": "medienstation 1", "ip": "192.168.1.30"}
          ]
   }
   ```
   
1. Programm starten

## Einstellungen
Die Einstellungen werden in der Datei `daten/settings.txt` im JSON-Format gespeichert.

| Einstellung | Typ | Standardwert | Beschreibung                                                                                                                                     |
|-------------|-----|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `Mauszeiger` | Boolean | `false`| Zeigt oder verbirgt den Mauszeiger in der Anwendung                                                                                              |
| `Vollbild` | Boolean | `true`| Startet die Anwendung im Vollbildmodus                                                                                                           |

Wenn die JSON-Datei fehlerhaft ist, werden die Standardwerte verwendet.

## Anforderungen an die Hardware
Das Programm ist beschränkt responsive. Optimiert ist es für Tablets mit einer Auflösung von 1920x1280.

## Update
**Vor dem Update**
- Proramm schliessen
- Folgende Dateien/Ordner im Ordner ``alter-Programm-Ordner/resources/daten`` sichern (z.B. auf den Desktop kopieren)
  - Datei ``settings.txt``
  - Datei ``savedMediaStations.json``
  - Falls vorhanden: Ordner ``theme``
 
**Update**
- Neues Programm herunterladen
- Altes Programm löschen

**Nach dem Update**
- Alle gesicherten Dateien in den Ordner ``resources/daten`` des neuen Programms kopieren (existierende Dateien überschreiben)
- Neues Programm öffnen

## Theme
- Farben, Fonts und ein optionales Logo oben links können über ein Theme definiert werden
- Wenn kein Theme vorhanden ist, wird das Default-Theme ohne Logo verwendet
- Um ein eigenes Theme zu erstellen:
   - Ordner ``theme-default`` kopieren
   - CSS und Fonts anpassen, evtl. Logo in den theme-Ordner kopieren
   - neuen theme-Ordner in theme umbenennen und in den Ordner ``resources/daten`` kopieren  

## Lizenz
Dieses Projekt steht unter der [GNU General Public License v3.0](LICENSE).

Das bedeutet: Der Code darf genutzt, verändert und weitergegeben werden, aber abgeleitete Werke müssen ebenfalls unter GPL-3.0 veröffentlicht werden.
