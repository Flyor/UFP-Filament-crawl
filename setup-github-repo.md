# 🚀 GitHub Repository Setup

## 📋 Schritt-für-Schritt Anleitung

### 1. **GitHub Repository erstellen**

1. **GitHub.com besuchen** und einloggen
2. **"New repository"** klicken
3. **Repository-Name:** `ufp-filament-crawler`
4. **Beschreibung:** `Intelligenter Tampermonkey-Script für UFP Filament-Crawling`
5. **Public** auswählen (für bessere Sichtbarkeit)
6. **"Create repository"** klicken

### 2. **Lokales Repository initialisieren**

```bash
# In deinem Projektordner
git init
git add .
git commit -m "Initial commit: UFP Filament Crawler v1.6.0"
git branch -M main
git remote add origin https://github.com/[DEIN-USERNAME]/ufp-filament-crawler.git
git push -u origin main
```

### 3. **Update-Links im Script anpassen**

**Ersetze `[DEIN-USERNAME]` in `ufp-filament-crawler.user.js`:**

```javascript
// @updateURL    https://raw.githubusercontent.com/[DEIN-USERNAME]/ufp-filament-crawler/main/ufp-filament-crawler.user.js
// @downloadURL  https://raw.githubusercontent.com/[DEIN-USERNAME]/ufp-filament-crawler/main/ufp-filament-crawler.user.js
// @supportURL   https://github.com/[DEIN-USERNAME]/ufp-filament-crawler/issues
```

**Beispiel für Username "maxmustermann":**
```javascript
// @updateURL    https://raw.githubusercontent.com/maxmustermann/ufp-filament-crawler/main/ufp-filament-crawler.user.js
// @downloadURL  https://raw.githubusercontent.com/maxmustermann/ufp-filament-crawler/main/ufp-filament-crawler.user.js
// @supportURL   https://github.com/maxmustermann/ufp-filament-crawler/issues
```

### 4. **Repository-Struktur**

```
ufp-filament-crawler/
├── ufp-filament-crawler.user.js    # Haupt-Script
├── README.md                       # Dokumentation
├── CHANGELOG.md                    # Versionshistorie
├── setup-github-repo.md           # Diese Anleitung
└── .gitignore                     # Git-Ignore-Datei
```

### 5. **GitHub-Features aktivieren**

#### **Issues aktivieren:**
- Repository → Settings → Features → Issues ✅

#### **Releases erstellen:**
- Repository → Releases → "Create a new release"
- **Tag:** `v1.6.0`
- **Title:** `UFP Filament Crawler v1.6.0`
- **Description:** Siehe CHANGELOG.md

### 6. **Automatische Updates testen**

1. **Script in Tampermonkey installieren**
2. **Version in Script auf 1.5.0 ändern** (zum Testen)
3. **Tampermonkey → Check for userscript updates**
4. **Update sollte automatisch erkannt werden**

## 🔧 Zusätzliche GitHub-Features

### **GitHub Pages (Optional)**
- Settings → Pages → Source: Deploy from a branch → main
- URL: `https://[DEIN-USERNAME].github.io/ufp-filament-crawler/`

### **GitHub Actions (Optional)**
- Automatische Tests bei Commits
- Automatische Releases bei Tags

### **GitHub Discussions (Optional)**
- Community-Diskussionen
- Feature-Requests
- Q&A

## 📝 Release-Workflow

### **Neue Version veröffentlichen:**

1. **Version in Script erhöhen:**
   ```javascript
   // @version      1.7.0
   ```

2. **CHANGELOG.md aktualisieren:**
   ```markdown
   ## [1.7.0] - 2025-01-XX
   ### ✨ Hinzugefügt
   - Neue Features...
   ```

3. **README.md Version aktualisieren:**
   ```markdown
   **Version:** 1.7.0
   ```

4. **Commit und Push:**
   ```bash
   git add .
   git commit -m "Release v1.7.0: Neue Features"
   git tag v1.7.0
   git push origin main --tags
   ```

5. **GitHub Release erstellen:**
   - Repository → Releases → "Create a new release"
   - Tag: `v1.7.0`
   - Upload: `ufp-filament-crawler.user.js`

## 🎯 Vorteile

### **Für Benutzer:**
- ✅ **Automatische Updates** - Tampermonkey erkennt neue Versionen
- ✅ **Einfache Installation** - Direkter Download-Link
- ✅ **Support** - GitHub Issues für Probleme
- ✅ **Transparenz** - Öffentlicher Code

### **Für dich:**
- ✅ **Versionierung** - Klare Versionshistorie
- ✅ **Feedback** - GitHub Issues für Bug-Reports
- ✅ **Community** - Andere können beitragen
- ✅ **Professionell** - Seriöses Open-Source-Projekt

## ⚠️ Wichtige Hinweise

### **Sicherheit:**
- ✅ **Keine sensiblen Daten** im Repository
- ✅ **Keine API-Keys** oder Passwörter
- ✅ **Nur öffentliche Informationen**

### **Rechtliches:**
- ✅ **MIT-Lizenz** verwenden
- ✅ **Haftungsausschluss** in README
- ✅ **Nutzungsbedingungen** von ufp.de beachten

---

**Nach dem Setup hast du ein professionelles Open-Source-Projekt mit automatischen Updates!** 🎉
