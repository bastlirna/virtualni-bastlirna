# Virtuální Bastlírna - Zápisy

[![Generate and deploy](https://github.com/bastlirna/virtualni-bastlirna/actions/workflows/generate-pages.yml/badge.svg)](https://github.com/bastlirna/virtualni-bastlirna/actions/workflows/generate-pages.yml)

Tento projekt generuje webovou stránku s přehledem zápisů Virtuální Bastlírny z markdown souborů.

<strong>https://virtualni.bastlirna.online/log/</strong>

## Struktura projektu
- `generator/` – generování HTML, šablony, skripty
- `zápis/` – zdrojové zápisy ve formátu Markdown
- `public/` – vygenerovaná webová stránka a statické soubory

## Generování
Spusťte:

```sh
node generator/generate.js
```

Výsledná stránka bude v `public/index.html`.

## Funkce
- Fulltextové vyhledávání v zápisech
- Filtrování podle tagů
- Přehled nejčastějších tagů
- Klikací tagy pro rychlé filtrování

