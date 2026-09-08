---
name: convert-wiki-to-md
description: Stáhne zápis Virtuální Bastlírny z DokuWiki pro zadané datum a převede jej do konzistentního Markdownu. Použij při importu nebo převodu zápisu z macgyver.sh.cvut.cz.
---

# Převod zápisu z DokuWiki do Markdownu

Pro uživatelem zadané datum proveď celý import: stáhni zdrojový zápis, ulož jeho nezměněnou podobu a vytvoř výsledný Markdown.

## Postup

1. Získej od uživatele datum ve formátu `YYYY-MM-DD`. Pokud datum chybí nebo nemá platný formát, vyžádej si jej.
2. Sestav adresy:
   - seznam zápisů: `https://macgyver.sh.cvut.cz/wiki/projekty/virtualnibastlirna`
   - zápis: `https://macgyver.sh.cvut.cz/wiki/projekty/virtualnibastlirna/YYYY-MM-DD`
   - surový DokuWiki zdroj: adresa zápisu s parametrem `?do=export_raw`
3. Stáhni surový DokuWiki zdroj přímo z adresy s `?do=export_raw`. Seznam zápisů použij k ověření dostupných dnů, pokud požadovaná stránka neexistuje nebo server vrátí neočekávaný obsah.
4. Ověř, že stažení uspělo a obsah je zápis v DokuWiki, nikoli HTML, přihlašovací stránka nebo chybové hlášení. Platný zápis obsahuje alespoň hlavní nadpis nebo sekci témat. Při chybě nevytvářej Markdown a popiš problém.
5. Ulož stažený obsah beze změn a v UTF-8 do `zápis_origo/YYYY-MM-DD.txt`. Soubor musí přesně odpovídat surové odpovědi serveru.
6. Převeď uložený zdroj podle pravidel níže a výsledek ulož v UTF-8 do `zápis/YYYY-MM-DD.md`.
7. Zkontroluj, že výsledný soubor má YAML front matter, právě jeden hlavní nadpis a všechna původní témata ve stejném pořadí. Informuj uživatele o obou uložených souborech a případných problémech.

## Pravidla převodu

- Zachovej jméno souboru podle data; změň pouze příponu z `.txt` na `.md`.
- Hlavní DokuWiki nadpis převeď na Markdown nadpis první úrovně a jeho text zachovej.
- Sekci `Statistiky` nahraď YAML front matterem na začátku souboru:
  - `Čas` převeď na `time` jako řetězec.
  - `Celkem se vystřídalo` převeď na `attendees` jako číslo.
  - `Ve špičce` převeď na `peak` jako číslo.
- Ostatní sekce mimo `Statistiky` a `Témata` zachovej ve stejném pořadí a převeď jejich DokuWiki formát do Markdownu.
- V sekci `Témata` představuje každá položka první úrovně jedno téma:
  - Text položky převeď na nadpis druhé úrovně.
  - Vnořené položky převeď na Markdown seznam pod tímto nadpisem a zachovej jejich vnoření.
  - Obsah a pořadí položek neměň.
  - Obsahuje-li název tématu odkaz, odeber odkaz z názvu a vlož jej jako první odrážku tématu. Ostatní text názvu neměň.
  - Nemá-li téma žádné podřízené položky, ponech pouze jeho nadpis.
- Ke každému nadpisu tématu doplň podle jeho obsahu nejvýše šest výstižných tagů:
  - Tag nesmí obsahovat mezery. Preferuj jedno slovo; víceslovný tag spoj pomlčkou.
  - Tagy připoj na konec nadpisu v jednom inline kódu ve formátu `` `#tag1, #tag2` ``.
  - Tagy nesmí měnit původní text názvu tématu.
- Zachovej původní text, odkazy, pořadí a význam. Měň pouze syntaxi a strukturu požadovanou těmito pravidly.

## Příklad

Vstup:

```dokuwiki
====== ⚡ Virtuální Bastlírna I. (25.3.2021) ======

===== Statistiky =====

^ Čas | 20:00 - 01:30 |
^ Celkem se vystřídalo | 51 účastníků |
^ Ve špičce | 30 účastníků online |

===== Témata =====

  * Téma 1
    * informace o tématu 1
    * další informace o tématu 1
```

Výstup:

```markdown
---
time: "20:00 - 01:30"
attendees: 51
peak: 30
---
# ⚡ Virtuální Bastlírna I. (25.3.2021)

## Téma 1 `#tag1, #tag2`
- informace o tématu 1
- další informace o tématu 1
```
