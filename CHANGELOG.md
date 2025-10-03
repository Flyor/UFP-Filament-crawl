# 📝 Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.6.0] - 2025-01-03

### ✨ Hinzugefügt
- **Änderungs-Tracking in CSV** - Status-Spalten in der Haupt-CSV
- **Separate Änderungs-CSV** - Zusätzliche Datei nur mit Änderungen
- **Erweiterte Hersteller-Erkennung** - ESUN, AZUREFILM, VERBATIM, DREMEL, SOLEYIN
- **Intelligente Hersteller-Bereinigung** - Entfernt "3D", "ENDER", "CR", etc.
- **Änderungs-Zusammenfassung** - Übersicht am Ende der CSV-Dateien

### 🔧 Verbessert
- **CSV-Dateinamen** - Enthalten jetzt Datum und Uhrzeit
- **Hersteller-Extraktion** - Flexiblere Erkennung im gesamten Produktnamen
- **Gewicht-Darstellung** - Konsistente Anzeige in Gramm ohne Einheit
- **Preis-Formatierung** - Entfernt "/STK", Komma als Dezimaltrennung
- **Preis pro kg** - Korrekte Formatierung mit Komma

### 🚀 Performance
- **Crawl-Geschwindigkeit** - 42% schneller durch reduzierte Wartezeiten
- **Daten-Extraktion** - Optimierte for-Schleifen statt forEach
- **DOM-Abfragen** - Weniger redundante Element-Suche

## [1.5.0] - 2025-01-03

### ✨ Hinzugefügt
- **Live-Log-Display** - Console-Ausgaben direkt im Script-Panel
- **Stop-Button** - Manueller Stopp des Crawlings möglich
- **Seiten-Limit** - Sicherheitscheck auf maximal 20 Seiten
- **Leere Seiten-Erkennung** - Automatischer Stopp bei 2 leeren Seiten hintereinander

### 🔧 Verbessert
- **Session-Management** - Bessere Wiederaufnahme nach Seitenreload
- **Fehlerbehandlung** - Konsistente Logging-Strategie
- **UI-Feedback** - Klarere Statusmeldungen

### 🐛 Behoben
- **Auto-Resume-Logik** - Korrekte automatische Fortsetzung
- **currentPage-Synchronisation** - UI zeigt korrekte Seitenzahl
- **Datenverlust** - Keine Datenverluste mehr bei manuellem Stopp

## [1.4.0] - 2025-01-03

### ✨ Hinzugefügt
- **Persistentes Crawling** - Automatische Fortsetzung nach Seitenreload
- **Session-Management** - Speichert Crawl-Status in localStorage
- **Historische Daten** - Vergleich mit vorherigen Crawls
- **Änderungs-Erkennung** - Identifiziert neue, entfernte und geänderte Produkte

### 🔧 Verbessert
- **Multi-Page-Crawling** - Robuste Navigation durch alle Seiten
- **Produkt-Selektion** - Verhindert Extraktion von "Zuletzt angesehenen Artikeln"
- **Authentifizierung** - Bessere Behandlung von eingeloggten Sessions

## [1.3.0] - 2025-01-03

### ✨ Hinzugefügt
- **Multi-Page-Support** - Automatisches Crawling aller Seiten
- **Dynamische Seitenerkennung** - Erkennt Gesamtseitenzahl automatisch
- **URL-Manipulation** - Intelligente Navigation durch Pagination

### 🔧 Verbessert
- **Produkt-Extraktion** - Erweiterte CSS-Selektoren
- **Fehlerbehandlung** - Robuste Behandlung von Netzwerkfehlern

## [1.2.0] - 2025-01-03

### ✨ Hinzugefügt
- **Verfügbarkeits-Erkennung** - Extrahiert Lagerbestand und Status
- **Preis pro kg** - Automatische Berechnung basierend auf Gewicht
- **Gewicht-Extraktion** - Erkennt verschiedene Einheiten (kg, gr, g)
- **Erweiterte CSV-Headers** - Zusätzliche Spalten für neue Daten

### 🔧 Verbessert
- **Daten-Extraktion** - Robustere Regex-Patterns
- **CSV-Format** - Bessere Strukturierung der Export-Daten

## [1.1.0] - 2025-01-03

### ✨ Hinzugefügt
- **CSV-Export** - Download der gecrawlten Daten
- **Datenvalidierung** - Überprüfung auf vollständige Produktinformationen
- **UI-Verbesserungen** - Bessere Benutzeroberfläche

### 🔧 Verbessert
- **Produkt-Extraktion** - Erweiterte Datenfelder
- **Fehlerbehandlung** - Bessere Behandlung von fehlenden Elementen

## [1.0.0] - 2025-01-03

### ✨ Erste Version
- **Grundlegendes Crawling** - Extraktion von Produktdaten von ufp.de
- **Tampermonkey-Integration** - Script für Chrome-Browser
- **Basis-Datenfelder** - Name, Artikelnummer, Hersteller, Material, Farbe, Preis
- **Einfache UI** - Grundlegende Benutzeroberfläche

---

## 📋 Geplante Features

### [1.7.0] - Geplant
- **Excel-Export** - Zusätzlicher Export in .xlsx-Format
- **Filter-Funktionen** - Filtern nach Hersteller, Material, Preis
- **Sortier-Optionen** - Sortieren nach verschiedenen Kriterien
- **Batch-Processing** - Verarbeitung mehrerer Suchbegriffe

### [1.8.0] - Geplant
- **E-Mail-Benachrichtigungen** - Benachrichtigung bei Preisänderungen
- **Webhook-Integration** - Automatische Datenübertragung
- **API-Interface** - REST-API für externe Anwendungen
- **Dashboard** - Web-basierte Übersicht der Crawl-Daten

### [2.0.0] - Geplant
- **Multi-Shop-Support** - Erweiterung auf andere Online-Shops
- **Cloud-Synchronisation** - Speicherung in der Cloud
- **Mobile App** - Native App für iOS/Android
- **Machine Learning** - Intelligente Preisvorhersagen

---

## 🔄 Versionsschema

- **MAJOR** (X.0.0) - Inkompatible API-Änderungen
- **MINOR** (X.Y.0) - Neue Features, rückwärtskompatibel
- **PATCH** (X.Y.Z) - Bug-Fixes, rückwärtskompatibel

## 📞 Support

Bei Fragen oder Problemen:
- **GitHub Issues** - Für Bug-Reports und Feature-Requests
- **Dokumentation** - Siehe README.md für detaillierte Anleitung
- **Community** - 3D-Druck-Community für allgemeine Fragen

---

**Letzte Aktualisierung:** 2025-01-03
