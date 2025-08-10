document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-box');
  const sectionNodes = Array.from(document.querySelectorAll('.section'));

  // Načti hledaný dotaz z URL hash
  function getSearchFromHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#search:')) {
      return decodeURIComponent(hash.slice(8));
    }
    return '';
  }

  // Nastav hash podle hledaného dotazu
  function setSearchHash(query) {
    if (query) {
      window.location.hash = '#search:' + encodeURIComponent(query);
    } else {
      window.location.hash = '';
    }
  }

  function highlightText(node, terms) {
    // Odstranit předchozí zvýraznění
    function removeHighlights(element) {
      const highlights = element.querySelectorAll('.text-highlight');
      highlights.forEach(span => {
        const parent = span.parentNode;
        parent.replaceChild(document.createTextNode(span.textContent), span);
        parent.normalize();
      });
    }
    removeHighlights(node);

    if (!terms || !terms.length) return;

    // Pomocná funkce pro odstranění diakritiky
    function stripDiacritics(str) {
      return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\u0300-\u036f/g, '');
    }

    // Zvýraznit hledané výrazy v textových uzlech
    function highlightInText(element, terms) {
      for (let child of Array.from(element.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          let text = child.textContent;
          let normText = stripDiacritics(text.toLowerCase());
          let replaced = false;
          let matchPositions = [];
          terms.forEach(term => {
            if (!term) return;
            const normTerm = stripDiacritics(term.toLowerCase());
            // Find all matches (case-insensitive, ignore diacritics)
            let regex = new RegExp(normTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            let match;
            while ((match = regex.exec(normText)) !== null) {
              matchPositions.push({start: match.index, end: match.index + match[0].length});
            }
          });
          if (matchPositions.length) {
            // Merge overlapping matches
            matchPositions.sort((a, b) => a.start - b.start);
            let merged = [];
            matchPositions.forEach(pos => {
              if (!merged.length || merged[merged.length-1].end <= pos.start) {
                merged.push(pos);
              } else {
                merged[merged.length-1].end = Math.max(merged[merged.length-1].end, pos.end);
              }
            });
            // Build fragment
            const frag = document.createDocumentFragment();
            let lastIndex = 0;
            merged.forEach(pos => {
              // Text before match
              if (pos.start > lastIndex) {
                frag.appendChild(document.createTextNode(text.slice(lastIndex, pos.start)));
              }
              // Highlighted match
              const span = document.createElement('span');
              span.className = 'text-highlight';
              span.textContent = text.slice(pos.start, pos.end);
              frag.appendChild(span);
              lastIndex = pos.end;
            });
            // Remaining text
            if (lastIndex < text.length) {
              frag.appendChild(document.createTextNode(text.slice(lastIndex)));
            }
            child.replaceWith(frag);
          }
        } else if (child.nodeType === Node.ELEMENT_NODE && !child.classList.contains('tag')) {
          // Rekurzivně, ale ne v .tag elementech
          highlightInText(child, terms);
        }
      }
    }
    highlightInText(node, terms);
  }

  function filterSections() {
    const query = searchInput.value.trim();
    setSearchHash(query);
    // Pomocná funkce pro odstranění diakritiky
    function stripDiacritics(str) {
      return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\u0300-\u036f/g, '');
    }
    // Odstranit zvýraznění tagů
    document.querySelectorAll('.tag-highlight').forEach(tag => tag.classList.remove('tag-highlight'));
    if (!query) {
      sectionNodes.forEach(sec => sec.style.display = '');
      sectionNodes.forEach(sec => highlightText(sec, []));
      // Zobrazit všechny soubory
      document.querySelectorAll('.md-file').forEach(file => file.style.display = '');
      return;
    }
    // Rozdělíme na podmínky
    const parts = query.split(/\s+/);
    const tags = parts.filter(p => p.startsWith('#')).map(t => t.toLowerCase());
    const dates = parts.filter(p => p.startsWith('@')).map(d => d.substring(1).toLowerCase());
    const words = parts.filter(p => !p.startsWith('#') && !p.startsWith('@')).map(w => w.toLowerCase());
    sectionNodes.forEach(sec => {
      // Získáme text sekce
      const text = sec.textContent.toLowerCase();
      const normText = stripDiacritics(text);
      // Získáme tagy
      const tagNodes = sec.querySelectorAll('.tag');
      const sectionTags = Array.from(tagNodes).map(t => t.textContent.toLowerCase());
      const normSectionTags = sectionTags.map(stripDiacritics);
      
      // Získáme soubor, ke kterému sekce patří
      const parentFile = sec.closest('.md-file');
      const fileName = parentFile ? parentFile.getAttribute('data-filename') : '';
      
      // Zvýraznění tagů podle shody
      tagNodes.forEach((tagNode, i) => {
        // Zvýraznění pro #tag hledání
        tags.forEach(tag => {
          const normTag = stripDiacritics(tag);
          if (normSectionTags[i].includes(normTag)) {
            tagNode.classList.add('tag-highlight');
          }
        });
        // Zvýraznění pro hledání slov v tagu
        words.forEach(word => {
          const normWord = stripDiacritics(word);
          if (normSectionTags[i].includes(normWord)) {
            tagNode.classList.add('tag-highlight');
          }
        });
      });
      
      // Podmínky
      let matches = true;
      
      // Pokud jsou specifikována data, zobraz všechny sekce v odpovídajících souborech
      if (dates.length > 0) {
        const fileMatches = dates.some(date => {
          if (!fileName) return false;
          const normFileName = stripDiacritics(fileName.toLowerCase());
          const normDate = stripDiacritics(date);
          return normFileName.includes(normDate);
        });
        
        if (fileMatches) {
          // Pokud soubor odpovídá datu, stále kontroluj ostatní podmínky (tagy a slova)
          // Musí splnit všechny tagy (částečná shoda)
          tags.forEach(tag => {
            const normTag = stripDiacritics(tag);
            if (!normSectionTags.some(t => t.includes(normTag))) matches = false;
          });
          // Musí splnit všechna slova (v textu nebo v tagu)
          words.forEach(word => {
            const normWord = stripDiacritics(word);
            const inText = normText.includes(normWord);
            const inTags = normSectionTags.some(t => t.includes(normWord));
            if (!inText && !inTags) matches = false;
          });
        } else {
          matches = false;
        }
      } else {
        // Standardní logika když nejsou specifikována data
        // Musí splnit všechny tagy (částečná shoda)
        tags.forEach(tag => {
          const normTag = stripDiacritics(tag);
          if (!normSectionTags.some(t => t.includes(normTag))) matches = false;
        });
        // Musí splnit všechna slova (v textu nebo v tagu)
        words.forEach(word => {
          const normWord = stripDiacritics(word);
          const inText = normText.includes(normWord);
          const inTags = normSectionTags.some(t => t.includes(normWord));
          if (!inText && !inTags) matches = false;
        });
      }
      
      sec.style.display = matches ? '' : 'none';
      highlightText(sec, matches ? words : []);
    });
    // Skrytí souborů bez viditelných sekcí nebo podle data
    document.querySelectorAll('.md-file').forEach(file => {
      let showFile = true;
      
      // Pokud jsou specifikována data, zobraz pouze odpovídající soubory
      if (dates.length > 0) {
        const fileName = file.getAttribute('data-filename');
        const fileMatches = dates.some(date => {
          if (!fileName) return false;
          const normFileName = stripDiacritics(fileName.toLowerCase());
          const normDate = stripDiacritics(date);
          return normFileName.includes(normDate);
        });
        if (!fileMatches) {
          showFile = false;
        }
      }
      
      // Pokud nejsou specifikována data, používej standardní logiku (viditelné sekce)
      if (dates.length === 0) {
        const visibleSections = Array.from(file.querySelectorAll('.section')).some(sec => sec.style.display !== 'none');
        showFile = visibleSections;
      }
      
      file.style.display = showFile ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', filterSections);
  // Synchronizace hash -> input
  window.addEventListener('hashchange', function() {
    const hashQuery = getSearchFromHash();
    if (searchInput.value !== hashQuery) {
      searchInput.value = hashQuery;
      filterSections();
      updateClearButton();
    }
  });

  // Při načtení stránky nastav input podle hash
  const initialQuery = getSearchFromHash();
  if (initialQuery) {
    searchInput.value = initialQuery;
    filterSections();
    updateClearButton();
  }

  // Křížek pro vymazání hledání
  const searchClear = document.getElementById('search-clear');
  function updateClearButton() {
    //searchClear.style.display = searchInput.value ? '' : 'none';
  }
  searchInput.addEventListener('input', updateClearButton);
  updateClearButton();
  searchClear.addEventListener('click', function() {
    searchInput.value = '';
    filterSections();
    updateClearButton();
    searchInput.focus();
  });
});
