# 🕷️ UFP Filament Crawler

**Version:** 1.6.3

Ein intelligenter Tampermonkey-Script für Chrome, der automatisch 3D-Filament-Produkte von ufp.de crawlt und die Daten in CSV-Format exportiert.

## ✨ Features

### 🔍 **Automatisches Crawling**
- **Multi-Page Support** - Crawlt automatisch alle Seiten einer Suche
- **Intelligente Erkennung** - Erkennt automatisch die Gesamtseitenzahl
- **Session-Management** - Setzt Crawling nach Seitenreload automatisch fort
- **Leere Seiten-Erkennung** - Stoppt automatisch bei leeren Seiten

### 📊 **Daten-Extraktion**
- **Produktinformationen** - Name, Artikelnummer, Hersteller, Material, Farbe
- **Preis & Verfügbarkeit** - Aktueller Preis, Preis pro kg, Lagerbestand
- **Intelligente Hersteller-Erkennung** - Erkennt CREALITY, ESUN, POLYMAKER, etc.
- **Erweiterte Farb-Erkennung** - Erkennt komplexe Farbnamen wie "Sapphire Blue", "Transparent Red"

### 📈 **Änderungs-Tracking**
- **Historische Daten** - Speichert vorherige Crawl-Ergebnisse
- **Änderungs-Erkennung** - Identifiziert neue, entfernte und geänderte Produkte
- **Preis-Monitoring** - Verfolgt Preisänderungen
- **Verfügbarkeits-Tracking** - Überwacht Lagerbestandsänderungen

### 📁 **CSV-Export**
- **Haupt-CSV** - Alle Produkte mit Änderungs-Status
- **Änderungs-CSV** - Separate Datei nur mit Änderungen
- **Zeitstempel** - Dateinamen enthalten Datum und Uhrzeit
- **Deutsche Formatierung** - Komma als Dezimaltrennung, korrekte Einheiten

## 🚀 Installation

### Voraussetzungen
- **Chrome Browser** (oder Chromium-basiert)
- **Tampermonkey Extension** - [Download hier](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

### Installation
1. **Tampermonkey installieren** (falls noch nicht vorhanden)
2. **Script-Datei öffnen** - `ufp-filament-crawler.user.js`
3. **In Tampermonkey importieren** - "Create a new script" → Code einfügen → Speichern
4. **UFP.de besuchen** - Script aktiviert sich automatisch

## 📖 Verwendung

### 1. **Vorbereitung**
- Auf ufp.de einloggen
- Zur gewünschten Produktkategorie navigieren (z.B. PLA Filament)
- Suchbegriff eingeben (z.B. "PLA")

### 2. **Crawling starten**
- **Script-Panel öffnen** - Klick auf Tampermonkey-Icon → Script auswählen
- **"Crawling starten"** klicken
- **Automatischer Ablauf** - Script crawlt alle Seiten automatisch

### 3. **Überwachung**
- **Live-Log** - Verfolge den Fortschritt im Script-Panel
- **Fortschrittsanzeige** - Aktuelle Seite, gecrawlte Produkte
- **Stop-Funktion** - Jederzeit manuell stoppen möglich

### 4. **Daten exportieren**
- **CSV-Export** - Nach Abschluss "CSV exportieren" klicken
- **Zwei Dateien** - Haupt-CSV + Änderungs-CSV (bei vorhandenen historischen Daten)
- **Automatischer Download** - Dateien werden heruntergeladen

## 📊 CSV-Format

### Haupt-CSV (Version 1.6.3+)
```csv
Name;Artikelnummer;Hersteller;Material;Farbe;Durchmesser;Gewicht;URL;Alter Preis;Neuer Preis;Alter Preis pro kg;Neuer Preis pro kg;Alte Verfügbarkeit;Neue Verfügbarkeit;Alter Lagernd;Neuer Lagernd;Status
```

**🎯 Verbesserung:** Alte und neue Werte stehen nebeneinander für besseren Vergleich!

### Änderungs-CSV
```csv
Typ;Name;Artikelnummer;Hersteller;Material;Farbe;Durchmesser;Gewicht;Aktueller Preis;Aktueller Preis pro kg;Aktuelle Verfügbarkeit;Aktuell Lagernd;URL;Alter Preis;Alte Verfügbarkeit;Änderung
```

### Status-Werte
- **"Neu"** - Neues Produkt
- **"Unverändert"** - Keine Änderungen
- **"Preis geändert"** - Preis hat sich geändert
- **"Verfügbarkeit geändert"** - Lagerbestand/Status hat sich geändert

## ⚙️ Konfiguration

### Geschwindigkeits-Einstellungen
```javascript
// Wartezeiten (in Millisekunden)
setTimeout(resolve, 800);     // Zwischen-Checks
setTimeout(() => {}, 1800);   // Seitenwechsel
setTimeout(() => {}, 1200);   // Auto-Resume
```

### Hersteller-Patterns
Das Script erkennt automatisch folgende Hersteller:
- CREALITY (inkl. ENDER, CR, HYPER SERIE)
- ESUN, POLYMAKER, HATCHBOX
- SUNLU, OVERTURE, AMZ3D
- ERYONE, GEEETECH, ELEGOO
- ANYCUBIC, FLASHFORGE, BAMBU
- PRINTBED, AZUREFILM, VERBATIM
- DREMEL, SOLEYIN

### Farb-Erkennung
Erkennt über 50 Farben inklusive:
- **Einfache Farben** - RED, BLUE, GREEN, BLACK, WHITE
- **Komplexe Farben** - SAPPHIRE BLUE, TRANSPARENT RED, METALLIC GOLD
- **Spezialeffekte** - GLOW IN THE DARK, MARBLE, WOOD

## 🔧 Technische Details

### Browser-Kompatibilität
- ✅ **Chrome** (empfohlen)
- ✅ **Edge** (Chromium-basiert)
- ✅ **Brave** (Chromium-basiert)
- ❌ **Firefox** (nicht getestet)

### Performance
- **Geschwindigkeit** - ~4,4s pro Seite (optimiert)
- **Speicher** - Lokale Speicherung in localStorage
- **CPU-Last** - Optimierte Schleifen und DOM-Abfragen

### Datenspeicherung
- **localStorage** - Persistente Speicherung der Crawl-Daten
- **Session-Management** - Automatische Fortsetzung nach Reload
- **Historische Daten** - Vergleich mit vorherigen Crawls

## 🛠️ Fehlerbehebung

### Häufige Probleme

#### **Script startet nicht**

- ✅ Falsche URL? <https://www.ufp.de/de_DE/printer-supplies-3d-verbrauchsmaterialien-pla-filament-3d/1463/?search_term=pla&page=1>

- ✅ Tampermonkey aktiviert?
- ✅ Auf ufp.de eingeloggt?
- ✅ Script-Panel geöffnet?

#### **Crawling stoppt früh**
- ✅ Internetverbindung stabil?
- ✅ Seite vollständig geladen?
- ✅ Keine Popup-Blocker?

#### **Falsche Hersteller-Erkennung**
- ✅ Produktname vollständig?
- ✅ Hersteller in der Pattern-Liste?
- ✅ Fallback-Pattern aktiv?

#### **CSV-Export funktioniert nicht**
- ✅ Browser-Downloads erlaubt?
- ✅ Popup-Blocker deaktiviert?
- ✅ Ausreichend Speicherplatz?

#### **Log und CSV zeigen unterschiedliche Werte**
- ✅ **Version 1.6.3+ behoben** - Log und CSV zeigen jetzt konsistente Änderungszählungen
- ✅ **Robuste Fehlerbehandlung** - Script funktioniert auch bei UI-Problemen

### Debug-Modus
```javascript
// In der Browser-Konsole aktivieren
localStorage.setItem('ufp-crawler-debug', 'true');
```

## 📝 Changelog

Siehe [CHANGELOG.md](CHANGELOG.md) für detaillierte Versionshistorie.

## 🤝 Beitragen

### Bug-Reports
- **Issue erstellen** mit detaillierter Beschreibung
- **Browser-Version** und **Tampermonkey-Version** angeben
- **Console-Logs** beifügen (falls vorhanden)

### Feature-Requests
- **Neue Hersteller** hinzufügen
- **Zusätzliche Datenfelder** extrahieren
- **Export-Formate** erweitern

## 📄 Lizenz

Dieses Projekt steht unter der Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.

**Erlaubt:**
- ✅ **Private Nutzung** - Für den persönlichen Gebrauch
- ✅ **Weitergabe** - Kopieren und verteilen
- ✅ **Attribution** - Mit Namensnennung

**Nicht erlaubt:**
- ❌ **Kommerzielle Nutzung** - Keine kommerzielle Verwendung
- ❌ **Modifikation** - Keine Änderungen oder Ableitungen
- ❌ **Distribution von Änderungen** - Keine Weitergabe modifizierter Versionen

Siehe [LICENSE](LICENSE) für Details.

## ⚠️ Haftungsausschluss

Dieses Script ist für den persönlichen Gebrauch bestimmt. Beachten Sie die Nutzungsbedingungen von ufp.de und verwenden Sie das Script verantwortungsvoll.

---

**Entwickelt mit ❤️ für die 3D-Druck-Community**
