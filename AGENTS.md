# Pokyny pro práci v repozitáři

Tento repozitář spravuje archiv zápisů Virtuální Bastlírny a generátor veřejného webu.

## Obsah

- `zápis/` je zdroj pravdy pro publikované zápisy v Markdownu.
- `zápis_origo/` uchovává nezměněné zdrojové zápisy v DokuWiki.
- `generator/` obsahuje Node.js generátor a webové šablony.
- `public/` je generovaný výstup; upravuj zdroje, nikoli soubory v tomto adresáři.

## Zápisy

- Pojmenovávej soubory podle data jako `YYYY-MM-DD.md`; odpovídající originál má jméno `YYYY-MM-DD.txt`.
- Každý Markdown zápis začíná YAML front matterem s poli `time`, `attendees` a `peak`, po kterém následuje právě jeden nadpis první úrovně.
- Jednotlivá témata jsou nadpisy druhé úrovně. Tagy zapisuj na konec nadpisu v jednom inline kódu, například `` `#elektronika, #měření` ``.
- Zachovej text, odkazy, vnoření a pořadí témat; při úpravách obsahu opravuj jen výslovně požadované části.
- Pro stažení nebo převod zápisu z DokuWiki vždy použij skill `.github/skills/convert-wiki-to-md/SKILL.md`; obsahuje úplný postup a pravidla převodu.

## Generátor

- Závislosti a příkazy spouštěj z adresáře `generator/`.
- Po změně generátoru, šablon nebo zápisů spusť `npm run generate`.
- Výsledkem úspěšného běhu je `public/index.html`; před dokončením zkontroluj, že generátor skončil bez chyby.
