function copyStaticFiles(srcDir, destDir) {
  const exts = ['.css', '.js'];
  // Vytvoř cílovou složku pokud neexistuje
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.readdirSync(srcDir)
    .filter(file => exts.some(ext => file.endsWith(ext)))
    .forEach(file => {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    });
}
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../zápis');
const publicDir = path.join(__dirname, '../public');
const outputFile = path.join(publicDir, 'index.html');
const templatePath = path.join(__dirname, './web/template.html');
const minTagCount = 8;

function getMarkdownFilePaths(dir) {
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.md'))
    .sort((a, b) => b.localeCompare(a))
    .map(file => path.join(dir, file));
}

function readMarkdownFiles(filePaths) {
  return filePaths.map(filePath => fs.readFileSync(filePath, 'utf8'));
}

function extractTagsFromHeading(heading) {
  // Najdi tagy ve formátu `#tag, #tag2` na konci nadpisu
  const tagMatch = heading.match(/`([^`]+)`\s*$/);
  if (!tagMatch) return [];
  return tagMatch[1].split(',').map(t => t.trim());
}

function cleanHeading(heading) {
  // Odstraň tagy v kódu na konci
  return heading.replace(/`([^`]+)`\s*$/, '').trim();
}

function splitSections(md) {
  // Rozdělí markdown na sekce podle nadpisů druhé úrovně
  const parts = md.split(/(^## .*$)/m);
  let result = [];
  for (let i = 1; i < parts.length; i += 2) {
    const headingRaw = parts[i];
    const body = parts[i + 1] || '';
    const tags = extractTagsFromHeading(headingRaw);
    const heading = cleanHeading(headingRaw);
    result.push({ heading, tags, body });
  }
  return result;
}

function pastelColorFromDate(date) {
  // Hash datumu na číslo
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = date.charCodeAt(i) + ((hash << 5) - hash);
  }
  // HSL: pastelová barva (světlost 85%, saturace 60%, hue podle hash)
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 85%)`;
}

function convertMarkdownFiles(markdownArray, filePaths) {
  // Každý MD soubor -> { date, color, sections, fileName }
  const files = markdownArray.map((md, index) => {
    const h1Match = md.match(/^#\s+(.+)$/m);
    const date = h1Match ? h1Match[1].trim() : '';
    let rest = md;
    if (h1Match) {
      rest = md.replace(/^#\s+.+$/m, '').trim();
    }
    const sections = splitSections(rest).map(sec => ({
      heading: marked.parse(sec.heading),
      tags: sec.tags,
      body: marked.parse(sec.body)
    }));
    const color = date ? pastelColorFromDate(date) : 'hsl(0,0%,60%)';
    const fileName = path.basename(filePaths[index], '.md');
    return { date, color, sections, fileName };
  });

  // Spočítej výskyty tagů
  const tagCounts = {};
  files.forEach(file => {
    file.sections.forEach(sec => {
      sec.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
  });
  // Vyfiltruj tagy s počtem >=2 a seřaď podle počtu sestupně
  const tagList = Object.entries(tagCounts)
    .filter(([tag, count]) => count >= minTagCount)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  return { files, tagList };
}

function loadTemplate(templateFilePath) {
  return fs.readFileSync(templateFilePath, 'utf8');
}

function renderHtml(files, templateSource) {
  const template = handlebars.compile(templateSource);
  return template(files);
}

function writeOutput(html, outputPath) {
  // Vytvoř složku pokud neexistuje
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, html, 'utf8');
}


function main() {
  const mdFilePaths = getMarkdownFilePaths(srcDir);
  const mdContents = readMarkdownFiles(mdFilePaths);
  const { files, tagList } = convertMarkdownFiles(mdContents, mdFilePaths);
  //console.log(files);
  const templateSource = loadTemplate(templatePath);
  const html = renderHtml({ files, tagList }, templateSource);
  writeOutput(html, outputFile);
  copyStaticFiles(path.join(__dirname, './web'), publicDir);
  console.log(`Vygenerováno: ${outputFile}`);
}

main();
