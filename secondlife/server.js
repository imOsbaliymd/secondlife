import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 80;

// 1. 基础中间件
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 3. 文件路径定义（迁移到共享存储中心）
const STORAGE_ROOT = path.join(__dirname, '..', 'storage');
const DATA_DIR = path.join(STORAGE_ROOT, 'data');
const UPLOAD_DIR = path.join(STORAGE_ROOT, 'uploads');
const DIST_DIR = path.join(__dirname, 'dist');

// 初始化目录
// 初始化目录与数据文件
if (!fs.existsSync(STORAGE_ROOT)) {
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log('✅ Created storage/uploads directory');
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('✅ Created storage/data directory');
}
const AUTHORS_FILE = path.join(DATA_DIR, 'authors.json');
const DOMAINS_FILE = path.join(DATA_DIR, 'domains.json');
const ARTICLES_DIR = path.join(DATA_DIR, 'articles');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const ensureJsonFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
};
ensureJsonFile(AUTHORS_FILE);
ensureJsonFile(DOMAINS_FILE);
if (!fs.existsSync(ARTICLES_DIR)) {
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
}
ensureJsonFile(USERS_FILE);

// 配置 Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// --- 4. API 接口 ---

// 读取数据（从拆分的 JSON 文件聚合）
app.get('/api/data', (req, res) => {
  try {
    const authors = JSON.parse(fs.readFileSync(AUTHORS_FILE, 'utf8')) || [];
    const domains = JSON.parse(fs.readFileSync(DOMAINS_FILE, 'utf8')) || [];
    let articles = [];
    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8'));
        if (content && content.id) articles.push(content);
      } catch {}
    }
    // 兼容旧 articles.json（仅在目录为空时迁移一次）
    const legacyFile = path.join(DATA_DIR, 'articles.json');
    if (articles.length === 0 && fs.existsSync(legacyFile)) {
      try {
        const legacy = JSON.parse(fs.readFileSync(legacyFile, 'utf8')) || [];
        articles = Array.isArray(legacy) ? legacy : [];
      } catch {}
    }
    const usersRaw = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) || [];
    const users = Array.isArray(usersRaw) ? usersRaw : [];
    res.json({ authors, domains, articles, users });
  } catch (err) {
    console.error('❌ Read Error:', err);
    res.status(200).json({ authors: [], domains: [], articles: [], users: [] });
  }
});

// 保存数据（分别写入分文件）
app.post('/api/data', (req, res) => {
  const { authors = [], domains = [], articles = [], users = [] } = req.body || {};
  try {
    fs.writeFileSync(AUTHORS_FILE, JSON.stringify(authors, null, 2));
    fs.writeFileSync(DOMAINS_FILE, JSON.stringify(domains, null, 2));
    if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });
    for (const art of articles) {
      if (!art || !art.id) continue;
      const filePath = path.join(ARTICLES_DIR, `${art.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(art, null, 2));
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Write Error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// 上传图片
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  console.log(`✅ File uploaded: ${fileUrl}`);
  res.json({ url: fileUrl });
});

// --- 5. 静态文件托管 ---

// 图片访问（新结构）
app.use('/uploads', express.static(UPLOAD_DIR));
// 兼容旧路径中的图片（如仍存在 secondlife/uploads）
const LEGACY_UPLOAD_DIR = path.join(__dirname, 'uploads');
if (fs.existsSync(LEGACY_UPLOAD_DIR)) {
  app.use('/uploads', express.static(LEGACY_UPLOAD_DIR));
}

// 前端静态资源
app.use(express.static(DIST_DIR));

// --- 6. 兜底路由 (SPA 支持) ---
app.get('*', (req, res) => {
  const indexHtml = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(404).send('Frontend build not found. Please run "npm run build".');
  }
});

// 启动服务
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📂 Storage (data): ${DATA_DIR}`);
  console.log(`🖼️ Storage (uploads): ${UPLOAD_DIR}`);
  console.log(`=========================================`);
});