const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'secondlife', 'database.json');
const outDir = path.join(__dirname, '..', 'storage', 'data');
const articlesDir = path.join(outDir, 'articles');

if (!fs.existsSync(src)) {
  console.error('Source database.json not found:', src);
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
if (!fs.existsSync(articlesDir)) {
  fs.mkdirSync(articlesDir, { recursive: true });
}

const raw = fs.readFileSync(src, 'utf8');
const data = JSON.parse(raw);

fs.writeFileSync(path.join(outDir, 'authors.json'), JSON.stringify(data.authors || [], null, 2));
fs.writeFileSync(path.join(outDir, 'domains.json'), JSON.stringify(data.domains || [], null, 2));
const articles = data.articles || [];
for (const art of articles) {
  if (!art || !art.id) continue;
  const filePath = path.join(articlesDir, `${art.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(art, null, 2));
}
fs.writeFileSync(path.join(outDir, 'users.json'), JSON.stringify(data.users || [], null, 2));

console.log('Split completed:', {
  authors: (data.authors || []).length,
  domains: (data.domains || []).length,
  articles: articles.length,
  users: (data.users || []).length,
});