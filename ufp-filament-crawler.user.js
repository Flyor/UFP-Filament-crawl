// ==UserScript==
// @name         UFP Filament Crawler
// @namespace    http://tampermonkey.net/
// @version      1.6.1
// @description  Crawlt UFP Filament-Produkte und extrahiert Produktdaten
// @author       Stonehiller Industries
// @match        https://www.ufp.de/de_DE/printer-supplies-3d-verbrauchsmaterialien-pla-filament-3d/*
// @updateURL    https://raw.githubusercontent.com/Flyor/UFP-Filament-crawl/main/ufp-filament-crawler.user.js
// @downloadURL  https://raw.githubusercontent.com/Flyor/UFP-Filament-crawl/main/ufp-filament-crawler.user.js
// @supportURL   https://github.com/Flyor/UFP-Filament-crawl/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Globale Variablen
    let crawledData = [];
    let isCrawling = false;
    let currentPage = 1;
    let totalPages = 0;
    let lastCrawlData = null;
    let crawlSession = null;
    let logEntries = [];

    // CSS für die UI
    const styles = `
        .ufp-crawler-ui {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            background: white;
            border: 2px solid #007bff;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
        }
        
        .ufp-crawler-header {
            background: #007bff;
            color: white;
            padding: 15px;
            border-radius: 8px 8px 0 0;
            text-align: center;
            font-weight: bold;
        }
        
        .ufp-crawler-content {
            padding: 15px;
        }
        
        .ufp-crawler-button {
            width: 100%;
            padding: 12px;
            margin: 5px 0;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        }
        
        .ufp-crawler-button.primary {
            background: #28a745;
            color: white;
        }
        
        .ufp-crawler-button.secondary {
            background: #6c757d;
            color: white;
        }
        
        .ufp-crawler-button.danger {
            background: #dc3545;
            color: white;
        }
        
        .ufp-crawler-button:disabled {
            background: #e9ecef;
            color: #6c757d;
            cursor: not-allowed;
        }
        
        .ufp-crawler-status {
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
        }
        
        .ufp-crawler-status.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        
        .ufp-crawler-status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .ufp-crawler-status.warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        
        .ufp-crawler-progress {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .ufp-crawler-progress-bar {
            height: 100%;
            background: #007bff;
            transition: width 0.3s ease;
        }
        
        .ufp-crawler-stats {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 12px;
        }
        
        .ufp-crawler-stats div {
            text-align: center;
        }
        
        .ufp-crawler-stats .number {
            font-size: 18px;
            font-weight: bold;
            color: #007bff;
        }
        
        .ufp-crawler-log {
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            max-height: 150px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.3;
        }
        
        .ufp-crawler-log-entry {
            margin: 2px 0;
            padding: 2px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .ufp-crawler-log-entry:last-child {
            border-bottom: none;
        }
        
        .ufp-crawler-log-timestamp {
            color: #6c757d;
            font-size: 10px;
        }
        
        .ufp-crawler-log-info {
            color: #007bff;
        }
        
        .ufp-crawler-log-success {
            color: #28a745;
        }
        
        .ufp-crawler-log-warning {
            color: #ffc107;
        }
        
        .ufp-crawler-log-error {
            color: #dc3545;
        }
    `;

    // CSS hinzufügen
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // UI erstellen
    function createUI() {
        const ui = document.createElement('div');
        ui.className = 'ufp-crawler-ui';
        ui.innerHTML = `
            <div class="ufp-crawler-header">
                🕷️ UFP Filament Crawler v1.0.0
            </div>
            <div class="ufp-crawler-content">
                <div class="ufp-crawler-status info">
                    Bereit zum Crawlen
                </div>
                
                <div class="ufp-crawler-stats">
                    <div>
                        <div class="number" id="crawled-count">0</div>
                        <div>Gecrawlt</div>
                    </div>
                    <div>
                        <div class="number" id="current-page">1</div>
                        <div>Seite</div>
                    </div>
                    <div>
                        <div class="number" id="total-pages">?</div>
                        <div>Gesamt</div>
                    </div>
                </div>
                
                <div class="ufp-crawler-progress">
                    <div class="ufp-crawler-progress-bar" id="progress-bar" style="width: 0%"></div>
                </div>
                
                <button class="ufp-crawler-button primary" id="start-crawl">
                    🚀 Crawling starten
                </button>
                
                <button class="ufp-crawler-button danger" id="stop-crawl" style="display: none;">
                    ⏹️ Crawling stoppen
                </button>
                
                <button class="ufp-crawler-button secondary" id="export-csv" disabled>
                    📊 CSV exportieren
                </button>
                
                <button class="ufp-crawler-button danger" id="clear-data">
                    🗑️ Daten löschen
                </button>
                
                <div class="ufp-crawler-log" id="crawler-log">
                    <div class="ufp-crawler-log-entry">
                        <span class="ufp-crawler-log-timestamp">[00:00:00]</span>
                        <span class="ufp-crawler-log-info">Crawler bereit</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(ui);
        
        // Event Listeners
        document.getElementById('start-crawl').addEventListener('click', startCrawling);
        document.getElementById('stop-crawl').addEventListener('click', stopCrawling);
        document.getElementById('export-csv').addEventListener('click', exportToCSV);
        document.getElementById('clear-data').addEventListener('click', clearData);
        
        // Initiale Log-Nachricht
        addLogEntry('Crawler bereit', 'info');
    }

    // Log-Eintrag hinzufügen
    function addLogEntry(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('de-DE');
        const logEntry = {
            timestamp: timestamp,
            message: message,
            type: type
        };
        
        logEntries.push(logEntry);
        
        // Nur die letzten 50 Einträge behalten
        if (logEntries.length > 50) {
            logEntries = logEntries.slice(-50);
        }
        
        // Log-UI aktualisieren
        updateLogDisplay();
        
        // Auch in Console ausgeben
        console.log(`[${timestamp}] ${message}`);
    }

    // Log-Anzeige aktualisieren
    function updateLogDisplay() {
        const logContainer = document.getElementById('crawler-log');
        if (!logContainer) return;
        
        logContainer.innerHTML = logEntries.map(entry => `
            <div class="ufp-crawler-log-entry">
                <span class="ufp-crawler-log-timestamp">[${entry.timestamp}]</span>
                <span class="ufp-crawler-log-${entry.type}">${entry.message}</span>
            </div>
        `).join('');
        
        // Zum neuesten Eintrag scrollen
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    // Produktdaten extrahieren
    function extractProductData() {
        const products = [];
        // Nur Produkte aus dem Hauptbereich, nicht aus "Zuletzt angesehenen Artikeln"
        const productElements = document.querySelectorAll('.product-result .js-product-col-item');
        
        // Optimierte Verarbeitung mit for-Schleife statt forEach
        for (let i = 0; i < productElements.length; i++) {
            const element = productElements[i];
            try {
                const product = {};
                
                // Produktname und Artikelnummer in einem Zug
                const titleElement = element.querySelector('.article-title a');
                const skuElement = element.querySelector('.sku');
                
                if (titleElement) {
                    product.name = titleElement.textContent.trim();
                }
                
                if (skuElement) {
                    product.sku = skuElement.textContent.replace('Art.-Nr.: ', '').trim();
                }
                
                // Preis
                const priceElement = element.querySelector('.price-sales');
                if (priceElement) {
                    // Preis extrahieren: /STK entfernen, € entfernen, Komma als Dezimaltrennung
                    let priceText = priceElement.textContent
                        .replace(/\/STK/g, '')  // /STK entfernen
                        .replace('€', '')       // € entfernen
                        .trim();
                    
                    // Komma als Dezimaltrennung beibehalten (deutsches Format)
                    product.price = priceText;
                }
                
                // Verfügbarkeit
                const stockElement = element.querySelector('.product-stock .stock');
                if (stockElement) {
                    const stockText = stockElement.textContent.trim();
                    if (stockText.includes('verfügbar:')) {
                        const availabilityMatch = stockText.match(/verfügbar:\s*(\d+)/);
                        if (availabilityMatch) {
                            product.availability = availabilityMatch[1];
                            product.inStock = true;
                        }
                    } else if (stockText.includes('nicht lagernd')) {
                        product.availability = '0';
                        product.inStock = false;
                    } else {
                        product.availability = '0';
                        product.inStock = false;
                    }
                } else {
                    product.availability = '0';
                    product.inStock = false;
                }
                
                // Produktlink
                const linkElement = element.querySelector('.article-title a');
                if (linkElement) {
                    product.url = linkElement.href;
                }
                
                // Produktbild
                const imgElement = element.querySelector('.image img');
                if (imgElement) {
                    product.imageUrl = imgElement.src || imgElement.getAttribute('data-src');
                }
                
                // Hersteller aus dem Namen extrahieren
                if (product.name) {
                    // Bekannte Hersteller-Muster (flexibler - nicht nur am Anfang)
                    const manufacturerPatterns = [
                        // Spezifische Hersteller
                        /(PRUSAMENT|PRUSA)\s/i,
                        /(POLYMAKER|POLYMAKER3D)\s/i,
                        /(HATCHBOX|HATCHBOX3D)\s/i,
                        /(SUNLU|SUNLU3D)\s/i,
                        /(OVERTURE|OVERTURE3D)\s/i,
                        /(AMZ3D|AMZ)\s/i,
                        /(ERYONE|ERYONE3D)\s/i,
                        /(GEEETECH|GEEETECH3D)\s/i,
                        /(ELEGOO|ELEGOO3D)\s/i,
                        /(CREALITY|CREALITY3D|CREALITY\s+ENDER|CREALITY\s+CR|CREALITY\s+HYPER\s+SERIE)\s/i,
                        /(ANYCUBIC|ANYCUBIC3D)\s/i,
                        /(FLASHFORGE|FLASHFORGE3D)\s/i,
                        /(BAMBU|BAMBU3D)\s/i,
                        /(PRINTBED|PRINTBED3D)\s/i,
                        /(ESUN|ESUN3D)\s/i,
                        /(AZUREFILM|AZUREFILM3D)\s/i,
                        /(VERBATIM|VERBATIM3D)\s/i,
                        /(DREMEL|DREMEL\s+DIGILAB)\s/i,
                        /(SOLEYIN|SOLEYIN\s+ULTRA)\s/i,
                        // Fallback für andere Hersteller (am Anfang des Namens)
                        /^([A-Z][A-Z\s]{2,20})\s/i
                    ];
                    
                    for (const pattern of manufacturerPatterns) {
                        const match = product.name.match(pattern);
                        if (match) {
                            let manufacturer = match[1].trim();
                            // Bereinige Hersteller-Namen
                            manufacturer = manufacturer.replace(/\s+3D\s*$/i, '');
                            manufacturer = manufacturer.replace(/\s+ENDER\s*$/i, '');
                            manufacturer = manufacturer.replace(/\s+CR\s*$/i, '');
                            manufacturer = manufacturer.replace(/\s+HYPER\s+SERIE\s*$/i, '');
                            manufacturer = manufacturer.replace(/\s+DIGILAB\s*$/i, '');
                            manufacturer = manufacturer.replace(/\s+ULTRA\s*$/i, '');
                            product.manufacturer = manufacturer;
                            break;
                        }
                    }
                }
                
                // Material aus dem Namen extrahieren
                if (product.name) {
                    const materialMatch = product.name.match(/(PLA\+?|EPLA|ABS|PETG|TPU|WOOD|METAL|CARBON)/i);
                    if (materialMatch) {
                        product.material = materialMatch[1].toUpperCase();
                    }
                }
                
                // Farbe aus dem Namen extrahieren
                if (product.name) {
                    // Umfassende Farb-Erkennung basierend auf realen Produktnamen
                    const colorPatterns = [
                        // Spezielle Polymaker Farben
                        /(CHARCOAL\s*BLACK|COTTON\s*WHITE|LAVA\s*RED|FORREST\s*GREEN|ARCTIC\s*TEAL|SAVANNAH\s*YELLOW|FOSSIL\s*GREY|SUNRISE\s*ORANGE|SAPPHIRE\s*BLUE|LAVENDER\s*PURPLE|EARTH\s*BROWN|SAKURA\s*PINK|WOOD\s*BROWN|PEANUT)/i,
                        /(ARMY\s*BEIGE|MUTED\s*GREEN|SKY\s*BLUE|LOTUS\s*PINK|ASH\s*GREY|ELECTRIC\s*INDIGO|FOREST\s*GREEN|LIME\s*GREEN|PASTEL\s*MINT|PASTEL\s*BANANA|PASTEL\s*CANDY|PASTEL\s*ICE|PASTEL\s*PEACH|PASTEL\s*PEANUT|PASTEL\s*WATERMELON|PASTEL\s*PEZRIWINKLE)/i,
                        /(ARMY\s*BLUE|ARMY\s*BROWN|ARMY\s*DARK\s*GREEN|ARMY\s*LIGHT\s*GREEN|MUTED\s*BLUE|ARMY\s*PURPLE|ARMY\s*RED|MUTED\s*PURPLE|MUTED\s*RED|MUTED\s*WHITE)/i,
                        
                        // ESUN Farben
                        /(MILKY\s*WHITE|LIGHT\s*KHAKI|DEEP\s*BLACK|MORANDI\s*GREEN|DARK\s*GREY|LIGHT\s*BLUE|ALMOND\s*YELLOW|PEACH\s*PINK|MINT\s*GREEN|LILAC|TANGERINE|STRAWBERRY\s*RED|MATCHA\s*GREEN|MORANDI\s*PURPLE)/i,
                        /(BONE\s*WHITE|SPACE\s*BLUE|VERY\s*PERI|MORNING\s*GLOW|SCORCHING\s*SUN|FOREST|UNIVERSE|CORAL)/i,
                        
                        // Creality Farben
                        /(MATTE\s*GREY|MATTE\s*GYPSUM\s*WHITE|MATTE\s*AVOCADO\s*GREEN|MATTE\s*STRAWBERRY\s*RED|MATTE\s*NAVY\s*BLUE|MATTE\s*BLACK|IVORY\s*WHITE|MATTE\s*SKIN\s*COLOR)/i,
                        /(SILK\s*SILVER|SILK\s*RED\s*COPPER|SILK\s*PURPLE|SILK\s*WHITE|SILK\s*GOLD|SILK\s*BLUE|SILK\s*GOLDEN|SILK\s*RAINBOW|SILK\s*COPPER|SILK\s*GOLDEN\s*RED|SILK\s*GOLDEN\s*SILVER|SILK\s*BLUE\s*GREEN|SILK\s*PINK\s*PURPLE|SILK\s*YELLOW\s*BLUE|SILK\s*BLUE\s*GREEN)/i,
                        
                        // Flashforge Farben
                        /(MATTE\s*LIGHT\s*GREY|MATTE\s*GREY\s*PINK|NATURE|SILK\s*GOLDEN|SILK\s*COPPER)/i,
                        
                        // Polymaker Silk Farben
                        /(SILK\s*BRASS|SILK\s*BRONZE|SILK\s*CHROME|SILK\s*LIME|SILK\s*LIGHT\s*BLUE|SILK\s*MAGENTA|SILK\s*ROSE|SILK\s*PERIDOT\s*GREEN|SILK\s*QUARTZ\s*PINK|SILK\s*ROSE\s*GOLD|SILK\s*TEAL|SILK\s*DARK\s*BLUE|SILK\s*GUNMETAL\s*GREY|SILK\s*PERIWINKLE)/i,
                        
                        // Polymaker Spezialfarben
                        /(MARBLE\s*SLATE\s*GREY|MARBLE\s*SANDSTONE|MARBLE\s*LIMESTONE|MARBLE\s*BRICK|DUAL\s*MATTE\s*CAMOUFLAGE|DUAL\s*MATTE\s*CAMELEON|DUAL\s*MATTE\s*FLAMINGO|DUAL\s*MATTE\s*FOGGY\s*ORANGE|DUAL\s*MATTE\s*FOGGY|DUAL\s*MATTE\s*SHADOW\s*BLACK|DUAL\s*MATTE\s*GLACIER\s*BLUE|DUAL\s*MATTE\s*MIXED\s*BERRIES|DUAL\s*MATTE\s*SHADOW\s*ORANGE|DUAL\s*MATTE\s*SHADOW\s*RED|DUAL\s*MATTE\s*SUNRISE)/i,
                        /(GRADIENT\s*SATIN\s*RAINBOW|GRADIENT\s*MATTE\s*WOOD|GRADIENT\s*MATTE\s*SPRING|GRADIENT\s*MATTE\s*FALL|GRADIENT\s*MATTE\s*SUMMER|GRADIENT\s*MATTE\s*CAPPUCCINO|GRADIENT\s*TRANSL\s*RAINBOW|GRADIENT\s*PASTEL\s*RAINBOW|GRADIENT\s*LUMINOUS\s*RAINBOW)/i,
                        
                        // Polymaker Luminous/Glow/Neon
                        /(LUMINOUS\s*BLUE|LUMINOUS\s*GREEN|LUMINOUS\s*PINK|LUMINOUS\s*ORANGE|LUMINOUS\s*YELLOW|GLOW\s*BLUE|GLOW\s*GREEN|NEON\s*GREEN|NEON\s*ORANGE|NEON\s*YELLOW|NEON\s*MAGENTA|NEON\s*RED)/i,
                        
                        // Polymaker Starlight
                        /(STARLIGHT\s*MARS|STARLIGHT\s*MERCURY|STARLIGHT\s*METEOR|STARLIGHT\s*NEBULA|STARLIGHT\s*JUPITER|STARLIGHT\s*NEPTUNE|STARLIGHT\s*AURORA|STARLIGHT\s*TWILIGHT|STARLIGHT\s*COMET)/i,
                        
                        // Polymaker Dual Silk
                        /(DUAL\s*SILK\s*AUGERGINE|DUAL\s*SILK\s*BANQUET|DUAL\s*SILK\s*CARIBBEAN\s*SEA|DUAL\s*SILK\s*BELUGA|DUAL\s*SILK\s*CAMELEON|DUAL\s*SILK\s*CROWN|DUAL\s*SILK\s*JADEITE|DUAL\s*SILK\s*SOVEREIGN|DUAL\s*SILK\s*SUNSET)/i,
                        
                        // Polymaker Celestial/Galaxy
                        /(CELESTIAL\s*BLUE|CELESTIAL\s*GREEN|CELESTIAL\s*PURPLE|GALAXY\s*DARK\s*GREEN|GALAXY\s*DARK\s*RED|GALAXY\s*BLACK|GALAXY\s*DARK\s*BLUE|GALAXY\s*DARK\s*GREY)/i,
                        
                        // ESUN Chameleon/Magic
                        /(CHAMELEON\s*TECH\s*BLACK|CHAMELEON\s*POLARIS|CHAMELEON\s*RASBERRY\s*RED|CHAMELEON\s*NEBULA\s*PURPLE|CHAMELEON\s*GALAXY\s*BLUE|MAGIC\s*DARK\s*TWINKL\s*GOLD|MAGIC\s*DARK\s*TWINKL\s*BLUE|MAGIC\s*DARK\s*TWINKL\s*GREEN|MAGIC\s*DARK\s*TWINKL\s*PURPLE)/i,
                        
                        // ESUN Silk Candy
                        /(SILK\s*CANDY\s*RED\s*GOLD\s*BLUE|SILK\s*CANDY\s*BLUE\s*GREEN|SILK\s*CANDY\s*SILVER\s*BLUE|SILK\s*CANDY\s*GOLDBLUEGREEN|SILK\s*CANDY\s*RED\s*GOLD|SILK\s*CANDY\s*SILVER\s*BLACK)/i,
                        
                        // ESUN Silk Magic
                        /(SILK\s*MAGIC\s*BLACK\s*RED|SILK\s*MAGIC\s*PURPLE\s*GOLD|SILK\s*MAGIC\s*BLACK\s*PURPLE|SILK\s*MAGIC\s*BLACK\s*GOLD|SILK\s*MAGIC\s*BLACK\s*GREEN|SILK\s*MAGIC\s*RED\s*GOLD|SILK\s*MAGIC\s*RED\s*GREEN|SILK\s*MAGIC\s*BLUE\s*SILVER)/i,
                        
                        // Transparente Farben
                        /(TRANSPARENT\s*ORANGE|TRANSPARENT\s*GREEN|TRANSPARENT\s*BLUE|TRANSPARENT\s*RED|TRANSL\s*BLUE\s*GREEN|TRANSL\s*BLUE\s*WHITE|TRANSL\s*YEL\s*GRN\s*BLUE|TRANSL\s*ORA\s*GRY\s*BLUE|TRANSL\s*BLUE\s*PURPLE|TRANSL\s*RAINBOW\s*B|TRANSL\s*RAINBOW\s*A|TRANSL\s*PURPLE\s*BLUE\s*CYAN|TRANSL\s*PURPLE\s*BLUE\s*GREY|TRANSL\s*PURPLE\s*RED|TRANSL\s*YELLOW\s*PINK|TRANSL\s*FLAME\s*CRYSTAL|TRANSL\s*CYAN\s*CRYSTAL|TRANSL\s*GREEN\s*CRYSTAL|TRANSL\s*BLUE\s*CRYSTAL|TRANSL\s*PINK\s*CRYSTAL)/i,
                        
                        // Rock/Stone Farben
                        /(ROCK\s*GRANITE|ROCK\s*HORNFELS|ROCK\s*BLUESCHIST|ROCK\s*SANDSTONE|ROCK\s*LIMESTONE|ROCK\s*QUARTZITE|ROCK\s*PEGMATITE|ROCK\s*TIGER\s*PORPHYRY)/i,
                        
                        // Dual/Marble Farben
                        /(DUAL\s*NEON\s*YELLOW\s*PINK|DUAL\s*BLUE\s*GREEN|DUAL\s*LIGHT\s*DARK\s*GREY|DUAL\s*GREEN\s*PURPLE|DUAL\s*RED\s*BLUE|DUAL\s*BLACK\s*WHITE|DUAL\s*RED\s*YELLOW|DUAL\s*PURPLE\s*BLUE|DUAL\s*RED\s*BLACK|DUAL\s*GREEN\s*BLUE|DUAL\s*PURPLE\s*YELLOW|DUAL\s*GREEN\s*PINK|MARBLE)/i,
                        
                        // Spezielle Effekte
                        /(SILK|MATTE|COLD|MILKY|PEARL|METALLIC|GLOW|NEON|FLUORESCENT|LUMINOUS|RAINBOW|CLEAR|TRANSPARENT|TRANSLUCENT|DUAL|GRADIENT|CHAMELEON|MAGIC|CANDY|STARLIGHT|CELESTIAL|GALAXY|ROCK|MARBLE)/i,
                        
                        // Einfache Grundfarben (als Fallback)
                        /(BLACK|WHITE|BLUE|RED|GREEN|YELLOW|ORANGE|GREY|GRAY|SILVER|GOLDEN|GOLD|PINK|PURPLE|BROWN|VIOLET|CYAN|MAGENTA|TEAL|LIME|BEIGE|CREAM|NATURAL|IVORY|BONE|COLD\s*WHITE|COOL\s*WHITE|WARM\s*WHITE|BRIGHT\s*ORANGE|BRIGHT\s*YELLOW|BRIGHT\s*GREEN|DARK\s*BLUE|DARK\s*RED|DARK\s*GREEN|DARK\s*GREY|DARK\s*PURPLE|LIGHT\s*BLUE|LIGHT\s*RED|LIGHT\s*GREEN|LIGHT\s*GREY|LIGHT\s*PURPLE|LIGHT\s*BROWN|NAVY\s*BLUE|SKY\s*BLUE|ROYAL\s*BLUE|BURGUNDY|CRIMSON|SCARLET|FOREST\s*GREEN|LIME\s*GREEN|EMERALD|CHARCOAL|PLATINUM|TITANIUM|LAVENDER|FUCHSIA|OLIVE\s*GREEN|FIRE\s*ENGINE|FIRE\s*ENG\s*RED|POWER\s*TOOL\s*RED|POWER\s*TOOL\s*YELLOW|POWER\s*TOOL\s*GREEN|POWER\s*TOOL\s*TEAL|ARMY\s*GREEN|SPACE\s*BLUE|VERY\s*PERI|VIVA\s*MAGENTA|PEACH\s*FUZZ|SKIN|BOT\s*GREEN|OCEAN\s*BLUE|PINE\s*YELLOW|MAC\s*PURPLE|ROSEHIP|STRAWBERRY)/i
                    ];
                    
                    for (const pattern of colorPatterns) {
                        const match = product.name.match(pattern);
                        if (match) {
                            product.color = match[1].toUpperCase();
                            break;
                        }
                    }
                }
                
                // Durchmesser aus dem Namen extrahieren
                if (product.name) {
                    const diameterMatch = product.name.match(/(1,75|2,85|3,0)/);
                    if (diameterMatch) {
                        product.diameter = diameterMatch[1] + 'mm';
                    }
                }
                
                // Gewicht aus dem Namen extrahieren
                if (product.name) {
                    const weightMatch = product.name.match(/(\d+(?:,\d+)?)\s*(kg|gr|g)/i);
                    if (weightMatch) {
                        // Gewicht immer in Gramm anzeigen (ohne Einheit)
                        let weightInGrams = parseFloat(weightMatch[1].replace(',', '.'));
                        if (weightMatch[2].toLowerCase() === 'kg') {
                            weightInGrams = weightInGrams * 1000; // kg zu Gramm
                        }
                        product.weight = Math.round(weightInGrams).toString();
                        
                        // Gewicht in kg für Preisberechnung
                        product.weightInKg = weightInGrams / 1000;
                    }
                }
                
                // Preis pro kg berechnen
                if (product.price && product.weightInKg) {
                    // Preis mit Komma als Dezimaltrennung parsen
                    const priceValue = parseFloat(product.price.replace(',', '.'));
                    const pricePerKg = priceValue / product.weightInKg;
                    // Komma als Dezimaltrennung für deutsches Format
                    product.pricePerKg = pricePerKg.toFixed(2).replace('.', ',');
                } else {
                    product.pricePerKg = '';
                }
                
                // Nur Produkte mit allen wichtigen Daten hinzufügen
                if (product.name && product.sku && product.price) {
                    products.push(product);
                }
                
            } catch (error) {
                console.error('Fehler beim Extrahieren der Produktdaten:', error);
            }
        }
        
        return products;
    }

    // Nächste Seite laden
    async function loadNextPage() {
        const currentUrl = new URL(window.location.href);
        const currentPage = parseInt(currentUrl.searchParams.get('page')) || 1;
        const nextPage = currentPage + 1;
        
        // Konstruiere URL für nächste Seite
        currentUrl.searchParams.set('page', nextPage);
        const nextPageUrl = currentUrl.toString();
        
        addLogEntry(`Prüfe Seite ${nextPage}...`, 'info');
        
        // Teste ob die nächste Seite existiert
        try {
            const response = await fetch(nextPageUrl, { 
                method: 'HEAD',
                credentials: 'same-origin' // Wichtig für eingeloggte Bereiche
            });
            
            if (response.ok) {
                addLogEntry(`Seite ${nextPage} existiert, lade...`, 'success');
                window.location.href = nextPageUrl;
                return true;
            } else {
                addLogEntry(`Seite ${nextPage} existiert nicht (Status: ${response.status})`, 'warning');
                return false;
            }
        } catch (error) {
            addLogEntry(`Fehler beim Testen der nächsten Seite: ${error.message}`, 'error');
            return false;
        }
    }

    // Gesamtseitenzahl dynamisch ermitteln
    function getTotalPages() {
        const pagination = document.querySelector('.pagination');
        if (pagination) {
            // Suche nach der höchsten Seitenzahl
            const pageLinks = pagination.querySelectorAll('a');
            let maxPage = 1;
            
            pageLinks.forEach(link => {
                const pageText = link.textContent.trim();
                const pageNum = parseInt(pageText);
                if (!isNaN(pageNum) && pageNum > maxPage) {
                    maxPage = pageNum;
                }
            });
            
            // Prüfe auch auf "..." oder ähnliche Indikatoren
            const paginationText = pagination.textContent;
            const dotsMatch = paginationText.match(/(\d+)\s*\.\.\./);
            if (dotsMatch) {
                const lastPage = parseInt(dotsMatch[1]);
                if (lastPage > maxPage) {
                    maxPage = lastPage;
                }
            }
            
            // Sicherheitscheck: Maximal 20 Seiten
            if (maxPage > 20) {
                addLogEntry(`Warnung: ${maxPage} Seiten erkannt, begrenze auf 20`, 'warning');
                maxPage = 20;
            }
            
            addLogEntry(`Gefundene maximale Seitenzahl: ${maxPage}`, 'info');
            return maxPage;
        }
        
        // Fallback: Versuche aus der URL oder anderen Elementen zu ermitteln
        const currentUrl = new URL(window.location.href);
        const currentPageNum = parseInt(currentUrl.searchParams.get('page')) || 1;
        
        addLogEntry(`Keine Pagination gefunden, verwende Fallback: ${currentPageNum}`, 'warning');
        return currentPageNum; // Nur die aktuelle Seite
    }

    // Historische Daten laden
    function loadHistoricalData() {
        try {
            const stored = localStorage.getItem('ufp-crawler-history');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Fehler beim Laden der historischen Daten:', error);
        }
        return null;
    }

    // Crawl-Session speichern
    function saveCrawlSession() {
        try {
            const session = {
                isCrawling: isCrawling,
                currentPage: currentPage,
                totalPages: totalPages,
                crawledData: crawledData,
                emptyPageCount: emptyPageCount,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('ufp-crawler-session', JSON.stringify(session));
            console.log('Crawl-Session gespeichert:', session);
        } catch (error) {
            console.error('Fehler beim Speichern der Crawl-Session:', error);
        }
    }

    // Crawl-Session laden
    function loadCrawlSession() {
        try {
            const stored = localStorage.getItem('ufp-crawler-session');
            if (stored) {
                const session = JSON.parse(stored);
                // Prüfe ob die Session nicht zu alt ist (max 1 Stunde)
                const sessionTime = new Date(session.timestamp);
                const now = new Date();
                const diffHours = (now - sessionTime) / (1000 * 60 * 60);
                
                if (diffHours < 1) {
                    console.log('Crawl-Session geladen:', session);
                    return session;
                } else {
                    console.log('Crawl-Session zu alt, wird gelöscht');
                    localStorage.removeItem('ufp-crawler-session');
                }
            }
        } catch (error) {
            console.error('Fehler beim Laden der Crawl-Session:', error);
        }
        return null;
    }

    // Crawl-Session löschen
    function clearCrawlSession() {
        localStorage.removeItem('ufp-crawler-session');
    }

    // Historische Daten speichern
    function saveHistoricalData(data) {
        try {
            const history = {
                timestamp: new Date().toISOString(),
                totalPages: data.totalPages,
                totalProducts: data.totalProducts,
                products: data.products.map(p => ({
                    sku: p.sku,
                    name: p.name,
                    price: p.price,
                    availability: p.availability,
                    inStock: p.inStock
                }))
            };
            
            localStorage.setItem('ufp-crawler-history', JSON.stringify(history));
            console.log('Historische Daten gespeichert:', history);
        } catch (error) {
            console.error('Fehler beim Speichern der historischen Daten:', error);
        }
    }

    // Änderungen im Vergleich zu historischen Daten erkennen
    function detectChanges(currentData, historicalData) {
        if (!historicalData) {
            return {
                newProducts: currentData.products.length,
                removedProducts: 0,
                priceChanges: 0,
                availabilityChanges: 0,
                isFirstRun: true
            };
        }

        const changes = {
            newProducts: 0,
            removedProducts: 0,
            priceChanges: 0,
            availabilityChanges: 0,
            isFirstRun: false
        };

        // Erstelle Maps für schnellen Vergleich
        const currentMap = new Map();
        const historicalMap = new Map();

        currentData.products.forEach(p => currentMap.set(p.sku, p));
        historicalData.products.forEach(p => historicalMap.set(p.sku, p));

        // Neue Produkte finden
        currentMap.forEach((product, sku) => {
            if (!historicalMap.has(sku)) {
                changes.newProducts++;
            }
        });

        // Entfernte Produkte finden
        historicalMap.forEach((product, sku) => {
            if (!currentMap.has(sku)) {
                changes.removedProducts++;
            }
        });

        // Preis- und Verfügbarkeitsänderungen finden
        currentMap.forEach((currentProduct, sku) => {
            const historicalProduct = historicalMap.get(sku);
            if (historicalProduct) {
                if (currentProduct.price !== historicalProduct.price) {
                    changes.priceChanges++;
                }
                if (currentProduct.availability !== historicalProduct.availability || 
                    currentProduct.inStock !== historicalProduct.inStock) {
                    changes.availabilityChanges++;
                }
            }
        });

        return changes;
    }

    // Globale Variablen für leere Seiten
    let emptyPageCount = 0;
    let lastProductCount = 0;

    // Crawling fortsetzen (für Session-Wiederherstellung)
    async function continueCrawling() {
        addLogEntry('continueCrawling aufgerufen', 'info');
        
        if (!isCrawling) {
            addLogEntry('Kein aktives Crawling, starte normal...', 'warning');
            await startCrawling();
            return;
        }
        
        const startButton = document.getElementById('start-crawl');
        const exportButton = document.getElementById('export-csv');
        const statusDiv = document.querySelector('.ufp-crawler-status');
        const progressBar = document.getElementById('progress-bar');
        
        try {
            // Aktuelle URL-Seite ermitteln
            const currentUrl = new URL(window.location.href);
            const urlPage = parseInt(currentUrl.searchParams.get('page')) || 1;
            
            // Session-Seite mit URL-Seite synchronisieren
            if (urlPage > currentPage) {
                currentPage = urlPage;
                addLogEntry(`Session-Seite auf URL-Seite ${urlPage} aktualisiert`, 'info');
            }
            
            addLogEntry(`Setze Crawling fort: Seite ${currentPage}/${totalPages}`, 'info');
            
            // Aktuelle Seite crawlen
            const products = extractProductData();
            crawledData = crawledData.concat(products);
            addLogEntry(`${products.length} Produkte auf Seite ${currentPage} gefunden`, 'success');
            
            // Leere Seiten erkennen
            if (products.length === 0) {
                emptyPageCount++;
                addLogEntry(`Leere Seite erkannt (${emptyPageCount}/2)`, 'warning');
                
                if (emptyPageCount >= 2) {
                    addLogEntry('2 leere Seiten in Folge - beende Crawling', 'warning');
                    await finishCrawling();
                    return;
                }
            } else {
                emptyPageCount = 0; // Reset bei gefundenen Produkten
            }
            
            // Prüfe ob Crawling gestoppt wurde
            if (!isCrawling) {
                addLogEntry('Crawling wurde gestoppt', 'warning');
                return;
            }
            
            // Session speichern vor Seitenwechsel
            saveCrawlSession();
            
            // Statistiken aktualisieren
            updateStats();
            
            // Fortschritt aktualisieren
            const progress = (currentPage / totalPages) * 100;
            progressBar.style.width = progress + '%';
            
            statusDiv.textContent = `Seite ${currentPage}/${totalPages} gecrawlt: ${products.length} Produkte gefunden (Gesamt: ${crawledData.length})`;
            
            // Kurz warten
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Nächste Seite versuchen
            const hasNextPage = await loadNextPage();
            if (hasNextPage) {
                const nextPage = currentPage + 1;
                addLogEntry(`Wechsle zu Seite ${nextPage}`, 'info');
                // Seite neu laden und weiter crawlen
                setTimeout(() => {
                    continueCrawling();
                }, 1800); // Wartezeit für Seitenlade (reduziert von 3s)
            } else {
                addLogEntry('Keine weitere Seite gefunden, beende Crawling', 'success');
                // Crawling beendet - historische Daten verarbeiten
                await finishCrawling();
            }
            
        } catch (error) {
            addLogEntry(`Fehler beim Fortsetzen des Crawlings: ${error.message}`, 'error');
            isCrawling = false;
            startButton.disabled = false;
            startButton.textContent = '🚀 Crawling starten';
            startButton.style.display = 'block';
            stopButton.style.display = 'none';
            statusDiv.className = 'ufp-crawler-status warning';
            statusDiv.textContent = 'Fehler beim Crawling aufgetreten.';
        }
    }

    // Crawling stoppen
    function stopCrawling() {
        addLogEntry('Crawling manuell gestoppt', 'warning');
        isCrawling = false;
        clearCrawlSession();
        
        const startButton = document.getElementById('start-crawl');
        const stopButton = document.getElementById('stop-crawl');
        const exportButton = document.getElementById('export-csv');
        const statusDiv = document.querySelector('.ufp-crawler-status');
        
        startButton.disabled = false;
        startButton.textContent = '🚀 Crawling starten';
        startButton.style.display = 'block';
        stopButton.style.display = 'none';
        
        if (crawledData.length > 0) {
            exportButton.disabled = false;
        }
        
        statusDiv.className = 'ufp-crawler-status warning';
        statusDiv.textContent = `Crawling gestoppt! ${crawledData.length} Produkte erfasst.`;
    }

    // Crawling starten
    async function startCrawling() {
        if (isCrawling) return;
        
        // Reset leere Seiten Zähler nur beim Neustart
        emptyPageCount = 0;
        lastProductCount = 0;
        
        addLogEntry('Crawling gestartet', 'info');
        isCrawling = true;
        const startButton = document.getElementById('start-crawl');
        const stopButton = document.getElementById('stop-crawl');
        const exportButton = document.getElementById('export-csv');
        const statusDiv = document.querySelector('.ufp-crawler-status');
        const progressBar = document.getElementById('progress-bar');
        
        startButton.disabled = true;
        startButton.style.display = 'none';
        stopButton.style.display = 'block';
        statusDiv.className = 'ufp-crawler-status info';
        statusDiv.textContent = 'Crawling gestartet...';
        
        // Gesamtseitenzahl dynamisch ermitteln
        if (totalPages === 0) {
            totalPages = getTotalPages();
            document.getElementById('total-pages').textContent = totalPages;
            addLogEntry(`${totalPages} Seiten erkannt`, 'info');
        }
        
        try {
            // Aktuelle Seite crawlen
            const products = extractProductData();
            crawledData = crawledData.concat(products);
            addLogEntry(`${products.length} Produkte auf Seite ${currentPage} gefunden`, 'success');
            
            // Leere Seiten erkennen
            if (products.length === 0) {
                emptyPageCount++;
                addLogEntry(`Leere Seite erkannt (${emptyPageCount}/2)`, 'warning');
                
                if (emptyPageCount >= 2) {
                    addLogEntry('2 leere Seiten in Folge - beende Crawling', 'warning');
                    await finishCrawling();
                    return;
                }
            } else {
                emptyPageCount = 0; // Reset bei gefundenen Produkten
            }
            
            // Session speichern vor Seitenwechsel
            saveCrawlSession();
            
            // Statistiken aktualisieren
            updateStats();
            
            // Fortschritt aktualisieren
            const progress = (currentPage / totalPages) * 100;
            progressBar.style.width = progress + '%';
            
            statusDiv.textContent = `Seite ${currentPage}/${totalPages} gecrawlt: ${products.length} Produkte gefunden (Gesamt: ${crawledData.length})`;
            
            // Kurz warten
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Nächste Seite versuchen
            const hasNextPage = await loadNextPage();
            if (hasNextPage) {
                const nextPage = currentPage + 1;
                addLogEntry(`Wechsle zu Seite ${nextPage}`, 'info');
                // Seite neu laden und weiter crawlen
                setTimeout(() => {
                    continueCrawling();
                }, 1800); // Wartezeit für Seitenlade (reduziert von 3s)
            } else {
                addLogEntry('Keine weitere Seite gefunden, beende Crawling', 'success');
                // Crawling beendet - historische Daten verarbeiten
                await finishCrawling();
            }
            
        } catch (error) {
            addLogEntry(`Fehler beim Crawling: ${error.message}`, 'error');
            isCrawling = false;
            startButton.disabled = false;
            startButton.textContent = '🚀 Crawling starten';
            startButton.style.display = 'block';
            stopButton.style.display = 'none';
            statusDiv.className = 'ufp-crawler-status warning';
            statusDiv.textContent = 'Fehler beim Crawling aufgetreten.';
        }
    }

    // Crawling abschließen und Änderungen analysieren
    async function finishCrawling() {
        const startButton = document.getElementById('start-crawl');
        const stopButton = document.getElementById('stop-crawl');
        const exportButton = document.getElementById('export-csv');
        const statusDiv = document.querySelector('.ufp-crawler-status');
        const progressBar = document.getElementById('progress-bar');
        
        // Historische Daten laden
        const historicalData = loadHistoricalData();
        
        // Aktuelle Crawl-Daten
        const currentData = {
            totalPages: totalPages,
            totalProducts: crawledData.length,
            products: crawledData
        };
        
        // Änderungen erkennen
        const changes = detectChanges(currentData, historicalData);
        
        // Historische Daten speichern
        saveHistoricalData(currentData);
        
        // Crawl-Session löschen
        clearCrawlSession();
        
        // Status aktualisieren
        isCrawling = false;
        startButton.disabled = false;
        startButton.textContent = '🚀 Crawling starten';
        startButton.style.display = 'block';
        stopButton.style.display = 'none';
        exportButton.disabled = false;
        progressBar.style.width = '100%';
        
        // Detaillierte Statusmeldung mit Änderungen
        let statusMessage = `Crawling abgeschlossen! ${crawledData.length} Produkte von ${totalPages} Seiten gefunden.`;
        
        if (changes.isFirstRun) {
            statusMessage += `\n🎉 Erster Crawl - ${changes.newProducts} Produkte erfasst.`;
            addLogEntry(`Erster Crawl abgeschlossen: ${changes.newProducts} Produkte erfasst`, 'success');
        } else {
            if (changes.newProducts > 0 || changes.removedProducts > 0 || changes.priceChanges > 0 || changes.availabilityChanges > 0) {
                statusMessage += `\n📊 Änderungen erkannt:`;
                if (changes.newProducts > 0) statusMessage += ` +${changes.newProducts} neue`;
                if (changes.removedProducts > 0) statusMessage += ` -${changes.removedProducts} entfernte`;
                if (changes.priceChanges > 0) statusMessage += ` ${changes.priceChanges} Preisänderungen`;
                if (changes.availabilityChanges > 0) statusMessage += ` ${changes.availabilityChanges} Verfügbarkeitsänderungen`;
                
                addLogEntry(`Änderungen erkannt: +${changes.newProducts} neue, -${changes.removedProducts} entfernte, ${changes.priceChanges} Preisänderungen, ${changes.availabilityChanges} Verfügbarkeitsänderungen`, 'info');
            } else {
                statusMessage += `\n✅ Keine Änderungen seit dem letzten Crawl.`;
                addLogEntry('Keine Änderungen seit dem letzten Crawl erkannt', 'success');
            }
        }
        
        statusDiv.className = 'ufp-crawler-status success';
        statusDiv.textContent = statusMessage;
        
        // Console-Log für detaillierte Analyse
        console.log('Crawling abgeschlossen:', {
            totalPages: totalPages,
            totalProducts: crawledData.length,
            changes: changes,
            historicalData: historicalData
        });
    }

    // Statistiken aktualisieren
    function updateStats() {
        document.getElementById('crawled-count').textContent = crawledData.length;
        document.getElementById('current-page').textContent = currentPage;
    }

    // Separate Änderungs-CSV erstellen
    function createChangesCSV(currentData, historicalData, changes, dateStr, timeStr) {
        const historicalMap = new Map();
        historicalData.products.forEach(product => {
            historicalMap.set(product.sku, product);
        });
        
        const changesData = [];
        
        // Neue Produkte
        currentData.forEach(product => {
            if (!historicalMap.has(product.sku)) {
                changesData.push({
                    type: 'NEU',
                    name: product.name,
                    sku: product.sku,
                    manufacturer: product.manufacturer,
                    material: product.material,
                    color: product.color,
                    diameter: product.diameter,
                    weight: product.weight,
                    price: product.price,
                    pricePerKg: product.pricePerKg,
                    availability: product.availability,
                    inStock: product.inStock,
                    url: product.url,
                    oldPrice: '',
                    oldAvailability: '',
                    change: 'Neues Produkt'
                });
            }
        });
        
        // Entfernte Produkte
        const currentMap = new Map();
        currentData.forEach(product => {
            currentMap.set(product.sku, product);
        });
        
        historicalData.products.forEach(product => {
            if (!currentMap.has(product.sku)) {
                changesData.push({
                    type: 'ENTFERNT',
                    name: product.name,
                    sku: product.sku,
                    manufacturer: product.manufacturer,
                    material: product.material,
                    color: product.color,
                    diameter: product.diameter,
                    weight: product.weight,
                    price: '',
                    pricePerKg: '',
                    availability: '',
                    inStock: false,
                    url: product.url,
                    oldPrice: product.price,
                    oldAvailability: product.availability,
                    change: 'Produkt nicht mehr verfügbar'
                });
            }
        });
        
        // Preisänderungen
        currentData.forEach(product => {
            const historicalProduct = historicalMap.get(product.sku);
            if (historicalProduct && product.price !== historicalProduct.price) {
                changesData.push({
                    type: 'PREISÄNDERUNG',
                    name: product.name,
                    sku: product.sku,
                    manufacturer: product.manufacturer,
                    material: product.material,
                    color: product.color,
                    diameter: product.diameter,
                    weight: product.weight,
                    price: product.price,
                    pricePerKg: product.pricePerKg,
                    availability: product.availability,
                    inStock: product.inStock,
                    url: product.url,
                    oldPrice: historicalProduct.price,
                    oldAvailability: historicalProduct.availability,
                    change: `Preis: ${historicalProduct.price} → ${product.price}`
                });
            }
        });
        
        // Verfügbarkeitsänderungen
        currentData.forEach(product => {
            const historicalProduct = historicalMap.get(product.sku);
            if (historicalProduct && 
                (product.availability !== historicalProduct.availability || 
                 product.inStock !== historicalProduct.inStock)) {
                changesData.push({
                    type: 'VERFÜGBARKEITSÄNDERUNG',
                    name: product.name,
                    sku: product.sku,
                    manufacturer: product.manufacturer,
                    material: product.material,
                    color: product.color,
                    diameter: product.diameter,
                    weight: product.weight,
                    price: product.price,
                    pricePerKg: product.pricePerKg,
                    availability: product.availability,
                    inStock: product.inStock,
                    url: product.url,
                    oldPrice: historicalProduct.price,
                    oldAvailability: historicalProduct.availability,
                    change: `Verfügbarkeit: ${historicalProduct.availability} → ${product.availability}`
                });
            }
        });
        
        // CSV-Header
        const headers = [
            'Typ', 'Name', 'Artikelnummer', 'Hersteller', 'Material', 'Farbe', 
            'Durchmesser', 'Gewicht', 'Aktueller Preis', 'Aktueller Preis pro kg', 
            'Aktuelle Verfügbarkeit', 'Aktuell Lagernd', 'URL', 'Alter Preis', 
            'Alte Verfügbarkeit', 'Änderung'
        ];
        
        // CSV-Inhalt
        const csvContent = [
            headers.join(';'),
            ...changesData.map(item => [
                `"${item.type}"`,
                `"${item.name || ''}"`,
                `"${item.sku || ''}"`,
                `"${item.manufacturer || ''}"`,
                `"${item.material || ''}"`,
                `"${item.color || ''}"`,
                `"${item.diameter || ''}"`,
                `"${item.weight || ''}"`,
                `"${item.price || ''}"`,
                `"${item.pricePerKg || ''}"`,
                `"${item.availability || ''}"`,
                `"${item.inStock ? 'Ja' : 'Nein'}"`,
                `"${item.url || ''}"`,
                `"${item.oldPrice || ''}"`,
                `"${item.oldAvailability || ''}"`,
                `"${item.change || ''}"`
            ].join(';'))
        ].join('\n');
        
        // Änderungs-CSV herunterladen
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ufp-filament-changes_${dateStr}_${timeStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        addLogEntry(`📊 Änderungs-CSV erstellt: ${changesData.length} Änderungen`);
    }

    // CSV exportieren
    function exportToCSV() {
        if (crawledData.length === 0) {
            alert('Keine Daten zum Exportieren vorhanden!');
            return;
        }
        
        // Datum für Dateiname
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        
        // Historische Daten für Änderungs-Tracking laden
        const historicalData = loadHistoricalData();
        const hasHistory = historicalData && historicalData.products;
        
        const headers = [
            'Name', 'Artikelnummer', 'Hersteller', 'Material', 'Farbe', 
            'Durchmesser', 'Gewicht', 'Preis', 'Preis pro kg', 'Verfügbarkeit', 'Lagernd', 'URL'
        ];
        
        // Änderungs-Spalten hinzufügen wenn historische Daten vorhanden
        if (hasHistory) {
            headers.push('Status', 'Alter Preis', 'Alte Verfügbarkeit');
        }
        
        // Erstelle Map für schnellen Vergleich mit historischen Daten
        const historicalMap = new Map();
        if (hasHistory) {
            historicalData.products.forEach(product => {
                historicalMap.set(product.sku, product);
            });
        }
        
        const csvContent = [
            headers.join(';'),
            ...crawledData.map(product => {
                const row = [
                    `"${product.name || ''}"`,
                    `"${product.sku || ''}"`,
                    `"${product.manufacturer || ''}"`,
                    `"${product.material || ''}"`,
                    `"${product.color || ''}"`,
                    `"${product.diameter || ''}"`,
                    `"${product.weight || ''}"`,
                    `"${product.price || ''}"`,
                    `"${product.pricePerKg || ''}"`,
                    `"${product.availability || ''}"`,
                    `"${product.inStock ? 'Ja' : 'Nein'}"`,
                    `"${product.url || ''}"`
                ];
                
                // Änderungs-Informationen hinzufügen wenn historische Daten vorhanden
                if (hasHistory) {
                    const historicalProduct = historicalMap.get(product.sku);
                    if (historicalProduct) {
                        // Produkt existiert bereits
                        let status = 'Unverändert';
                        if (product.price !== historicalProduct.price) {
                            status = 'Preis geändert';
                        } else if (product.availability !== historicalProduct.availability || 
                                  product.inStock !== historicalProduct.inStock) {
                            status = 'Verfügbarkeit geändert';
                        }
                        
                        row.push(`"${status}"`);
                        row.push(`"${historicalProduct.price || ''}"`);
                        row.push(`"${historicalProduct.availability || ''}"`);
                    } else {
                        // Neues Produkt
                        row.push('"Neu"');
                        row.push('""');
                        row.push('""');
                    }
                }
                
                return row.join(';');
            })
        ];
        
        // Änderungs-Zusammenfassung hinzufügen wenn historische Daten vorhanden
        if (hasHistory) {
            const changes = detectChanges({
                totalPages: 0,
                totalProducts: crawledData.length,
                products: crawledData
            }, historicalData);
            
            csvContent.push(''); // Leere Zeile
            csvContent.push('# Änderungen seit letztem Crawl:');
            csvContent.push(`# +${changes.newProducts} neue Produkte, -${changes.removedProducts} entfernte, ${changes.priceChanges} Preisänderungen, ${changes.availabilityChanges} Verfügbarkeitsänderungen`);
            csvContent.push(`# Crawl-Datum: ${now.toLocaleString('de-DE')}`);
            csvContent.push(`# Letzter Crawl: ${new Date(historicalData.timestamp).toLocaleString('de-DE')}`);
        }
        
        const finalCsvContent = csvContent.join('\n');
        
        // CSV-Datei herunterladen
        const blob = new Blob([finalCsvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ufp-filament-crawler_${dateStr}_${timeStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Separate Änderungs-CSV erstellen wenn historische Daten vorhanden
        if (hasHistory) {
            const changes = detectChanges({
                totalPages: 0,
                totalProducts: crawledData.length,
                products: crawledData
            }, historicalData);
            
            // Nur Änderungs-CSV erstellen wenn es Änderungen gibt
            if (changes.newProducts > 0 || changes.removedProducts > 0 || changes.priceChanges > 0 || changes.availabilityChanges > 0) {
                createChangesCSV(crawledData, historicalData, changes, dateStr, timeStr);
            }
        }
        
        // Status aktualisieren
        const statusDiv = document.querySelector('.ufp-crawler-status');
        statusDiv.className = 'ufp-crawler-status success';
        statusDiv.textContent = `CSV exportiert: ${crawledData.length} Produkte`;
    }

    // Daten löschen
    function clearData() {
        if (confirm('Alle gecrawlten Daten und historischen Daten löschen?')) {
            crawledData = [];
            isCrawling = false;
            currentPage = 1;
            totalPages = 0;
            emptyPageCount = 0;
            lastProductCount = 0;
            
            localStorage.removeItem('ufp-crawler-history');
            localStorage.removeItem('ufp-crawler-session');
            updateStats();
            
            const statusDiv = document.querySelector('.ufp-crawler-status');
            const progressBar = document.getElementById('progress-bar');
            const exportButton = document.getElementById('export-csv');
            const startButton = document.getElementById('start-crawl');
            const stopButton = document.getElementById('stop-crawl');
            
            statusDiv.className = 'ufp-crawler-status info';
            statusDiv.textContent = 'Bereit zum Crawlen';
            progressBar.style.width = '0%';
            exportButton.disabled = true;
            
            if (startButton) {
                startButton.disabled = false;
                startButton.style.display = 'block';
                startButton.textContent = '🚀 Crawling starten';
            }
            
            if (stopButton) {
                stopButton.style.display = 'none';
            }
            
            document.getElementById('total-pages').textContent = '0';
            
            addLogEntry('Alle Daten gelöscht - Neustart möglich', 'info');
        }
    }

    // Initialisierung
    function init() {
        // Prüfen ob wir auf der richtigen Seite sind
        if (window.location.href.includes('ufp.de') && window.location.href.includes('filament')) {
            createUI();
            
            // Prüfe ob eine aktive Crawl-Session existiert
            const session = loadCrawlSession();
            if (session && session.isCrawling) {
                addLogEntry('Aktive Crawl-Session gefunden, setze automatisch fort...', 'info');
                
                // Session-Daten wiederherstellen
                isCrawling = session.isCrawling;
                currentPage = session.currentPage;
                totalPages = session.totalPages;
                crawledData = session.crawledData || [];
                emptyPageCount = session.emptyPageCount || 0;
                
                addLogEntry(`Session wiederhergestellt: ${crawledData.length} Produkte, Seite ${currentPage}/${totalPages}, leere Seiten: ${emptyPageCount}`, 'info');
                
                // UI aktualisieren
                updateStats();
                document.getElementById('total-pages').textContent = totalPages;
                
                const statusDiv = document.querySelector('.ufp-crawler-status');
                const progressBar = document.getElementById('progress-bar');
                const startButton = document.getElementById('start-crawl');
                const stopButton = document.getElementById('stop-crawl');
                const exportButton = document.getElementById('export-csv');
                
                if (statusDiv) {
                    statusDiv.className = 'ufp-crawler-status info';
                    statusDiv.textContent = `Crawling wird fortgesetzt... Seite ${currentPage}/${totalPages} (${crawledData.length} Produkte)`;
                }
                
                if (progressBar) {
                    const progress = (currentPage / totalPages) * 100;
                    progressBar.style.width = progress + '%';
                }
                
                if (startButton) {
                    startButton.disabled = true;
                    startButton.style.display = 'none';
                }
                
                if (stopButton) {
                    stopButton.style.display = 'block';
                }
                
                if (exportButton) {
                    exportButton.disabled = true;
                }
                
                // Crawling automatisch fortsetzen
                setTimeout(() => {
                    addLogEntry('Starte automatische Fortsetzung des Crawlings...', 'info');
                    continueCrawling();
                }, 1200);
                
            } else {
                // Normale Initialisierung
                const historicalData = loadHistoricalData();
                if (historicalData) {
                    console.log('Letzter Crawl:', {
                        datum: new Date(historicalData.timestamp).toLocaleString('de-DE'),
                        seiten: historicalData.totalPages,
                        produkte: historicalData.totalProducts
                    });
                    
                    // Zeige letztes Crawl-Datum in der UI
                    const statusDiv = document.querySelector('.ufp-crawler-status');
                    if (statusDiv) {
                        const lastCrawlDate = new Date(historicalData.timestamp).toLocaleDateString('de-DE');
                        statusDiv.textContent = `Bereit zum Crawlen (Letzter Crawl: ${lastCrawlDate})`;
                    }
                }
            }
            
            console.log('UFP Filament Crawler geladen');
        }
    }

    // Starten wenn die Seite geladen ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
