---
mode: agent
---

V tomto repositáři jsou zápisi ze schůzek. Pouvodně byly psané ve formátu dokuwiki. Cílem je převést je do formátu Markdown a zároveň je převést do předem definované struktury, tak aby každý zípis měl konzistetní strukturu i v případě že původní zápis byl psaný různými lidmi a různým stylem.

# Postup

- Původní zápisi jsou v adresáři `original`
- Nové zápisy budou v adresáři `zápis`
- Pro každou schůzku existuje jeden soubor, jméno je datum. Jméno zůstane zachování, bude použita přípona .md
- Nejvýžší úroveň zůstane zachována, jen se převede do MD
- Sekce statistiky bzde převedena do yaml-in-front-matter, který bude na začátku souboru
- Sekce Témata obsahuje seznam probraných témat jako odrážkový seznam, ten bude převeden následujícím způsobem:
  - Seznam bude rozdělen na témata, kde první úroveň seznamu bude název tématu (nadpis 2. úrovně)
  - Pod odrážky budou přidány jako seznam pod nadpis tématu
  - Pokud název tématu obsahuje nějaké odkazy, odeber ho z nazvu a přidej jako první odrážku pod název tématu
  - Text odrážek ani název tématu jinak v žádném případě nemodifikuj
  - Doplň vhodné tagy podle obsahu sekce
    - Tagů by nemělo být více nže 6
    - Tag nesmí obsahovat mezeru a ideálně být jednolosný, pokud to není možné, použij pomlčku (např. pokud to je jeméno produktu a podobně)
    - Tagy budou doplněny na konec každého nadpisu tématu, formát tagů bude `#tag1, #tag2` uvozený jako md kód (znaky `)
- Změny proveď přímo do cílového soubru a informuj o výsledku
- V případě že je tam nějaký problém, napiš o něm

# Příklad

```dokuwiki
====== ⚡ Virtuální Bastlírna I. (25.3.2021) ======

===== Statistiky =====

^ Čas    | 20:00 - 01:30 |
^ Celkem se vystřídalo | 51 účastníků |
^ Ve špičce    | 30 účastníků online |

===== Témata (a odkazy co jste nestihli opsat) =====

  * Téma 1
    * informace o tématu 1
    * další informace o tématu 1
  * Téma 2
    * informace o tématu 2
    * další informace o tématu 2
```

Výsledek:

```markdown
---
time: "20:00 - 01:30"
attendees: 51
peak: 30
--- 
# ⚡ Virtuální Bastlírna I. (25.3.2021)

## Téma 1 ˙#tag1 #tag2˙
- informace o tématu 1
- další informace o tématu 1
## Téma 2 ˙#tag3, #tag4˙
- informace o tématu 2
- další informace o tématu 2
```

