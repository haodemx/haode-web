const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = '/Users/mac/Desktop/haode产品素材';
const TARGET_ROOT = path.join(ROOT, 'assets', 'products');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm']);

const IPHONE_OLED_SLUGS = [
  'x',
  'xsmax',
  '11',
  '11pro',
  '11promax',
  '12-12pro',
  '12mini',
  '12pro',
  '12promax',
  '13',
  '13mini',
  '13pro',
  '13promax',
  '14',
  '14plus',
  '14pro',
  '14promax',
  '15',
  '15plus',
  '15promax',
  '16',
  '16plus',
  '16pro',
  '16promax',
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function extOf(filePath) {
  return path.extname(filePath).toLowerCase();
}

function isImage(filePath) {
  return IMAGE_EXTENSIONS.has(extOf(filePath));
}

function isVideo(filePath) {
  return VIDEO_EXTENSIONS.has(extOf(filePath));
}

function directFiles(dirPath) {
  if (!exists(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
    .map((entry) => path.join(dirPath, entry.name))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b), 'zh-Hans-CN', { numeric: true }));
}

function copyImageAsJpg(source, target) {
  ensureDir(path.dirname(target));
  unlockTarget(target);
  const ext = extOf(source);
  if (ext === '.jpg' || ext === '.jpeg') {
    fs.copyFileSync(source, target);
    return;
  }

  const result = spawnSync('sips', ['-s', 'format', 'jpeg', source, '--out', target], {
    encoding: 'utf8',
  });
  if (result.error || result.status !== 0) {
    throw new Error(`No se pudo convertir imagen: ${source}`);
  }
}

function copyVideo(source, target) {
  ensureDir(path.dirname(target));
  unlockTarget(target);
  fs.copyFileSync(source, target);
}

function unlockTarget(target) {
  if (!exists(target)) return;
  spawnSync('chflags', ['nouchg', target], { encoding: 'utf8' });
  spawnSync('chmod', ['u+w', target], { encoding: 'utf8' });
}

function cleanModelName(name) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/\([^)]+\)/g, '')
    .replace(/-[a-f0-9]{10,}$/i, '')
    .replace(/（[^）]+）/g, '')
    .replace(/测屏视频|测试视频|oled|incell|logo|主图|带水印|美版|欧版|欧|比较|图片_\d+_\d+_\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function iphoneSlugFromVideo(filePath) {
  const base = path.basename(filePath).toLowerCase().replace(/\.[^.]+$/, '').replace(/\([^)]+\)/g, '').trim();
  return base
    .replace(/12\s+12pro/g, '12-12pro')
    .replace(/\s+/g, '')
    .replace(/promax/g, 'promax')
    .replace(/plus/g, 'plus')
    .replace(/mini/g, 'mini');
}

function samsungSlugFromFile(filePath) {
  const cleaned = cleanModelName(path.basename(filePath))
    .replace(/s2ou/gi, 's20u')
    .replace(/\+/g, ' plus ')
    .replace(/[_-]+/g, ' ');
  const compact = cleaned.replace(/\s+/g, '');

  if (/^n8/.test(compact) || /^note8/.test(compact)) return 'note-8';
  if (/^n9/.test(compact) || /^note9/.test(compact)) return 'note-9';
  if (/^n10plus/.test(compact) || /^note10plus/.test(compact)) return 'note-10-plus';
  if (/^n10/.test(compact) || /^note10/.test(compact)) return 'note-10';
  if (/^n20u/.test(compact) || /^note20u/.test(compact)) return 'note-20-ultra';
  if (/^n20/.test(compact) || /^note20/.test(compact)) return 'note-20';

  const samsungMatch = compact.match(/^s(\d{1,2})(fe|plus|ultra|u)?/);
  if (!samsungMatch) return null;

  const [, number, suffix] = samsungMatch;
  if (suffix === 'fe') return `s${number}-fe`;
  if (suffix === 'plus') return `s${number}-plus`;
  if (suffix === 'ultra' || suffix === 'u') return `s${number}-ultra`;
  return `s${number}`;
}

function groupSamsungFiles(sourceDir) {
  const groups = new Map();
  for (const file of directFiles(sourceDir)) {
    if (!isImage(file) && !isVideo(file)) continue;
    const slug = samsungSlugFromFile(file);
    if (!slug) continue;
    if (!groups.has(slug)) groups.set(slug, { images: [], videos: [] });
    const group = groups.get(slug);
    if (isImage(file)) group.images.push(file);
    if (isVideo(file)) group.videos.push(file);
  }
  return groups;
}

function scoreSamsungImage(filePath) {
  const name = path.basename(filePath);
  let score = 0;
  if (/\(logo\)|logo/i.test(name)) score += 20;
  if (/主图|带水印/i.test(name)) score += 15;
  if (/1pro1/i.test(name)) score += 5;
  if (/比较|图片_/i.test(name)) score -= 20;
  return score;
}

function writeSamsungGroup(targetSeries, slug, group) {
  const targetDir = path.join(TARGET_ROOT, targetSeries, slug);
  ensureDir(targetDir);

  const images = group.images
    .slice()
    .sort((a, b) => scoreSamsungImage(b) - scoreSamsungImage(a) || path.basename(a).localeCompare(path.basename(b)));

  if (images[0]) copyImageAsJpg(images[0], path.join(targetDir, 'main.jpg'));
  images.slice(1, 4).forEach((file, index) => {
    copyImageAsJpg(file, path.join(targetDir, `gallery-${String(index + 1).padStart(2, '0')}.jpg`));
  });

  group.videos.slice(0, 2).forEach((file, index) => {
    copyVideo(file, path.join(targetDir, `video-${String(index + 1).padStart(2, '0')}.mp4`));
  });
}

function syncIphoneOled() {
  const sourceDir = path.join(SOURCE_ROOT, 'IPHONE OLED');
  const videoDir = path.join(sourceDir, 'IPHONE OLED VIDEO');
  const targetSeries = 'iphone-oled';
  const images = directFiles(sourceDir).filter(isImage);
  const videosBySlug = new Map();

  for (const video of directFiles(videoDir).filter(isVideo)) {
    videosBySlug.set(iphoneSlugFromVideo(video), video);
  }

  const soft16pm = images.filter((file) => /sofe\s*16pm/i.test(path.basename(file)));
  const regularImages = images.filter((file) => !soft16pm.includes(file));
  const assignments = new Map();

  IPHONE_OLED_SLUGS.forEach((slug, index) => {
    assignments.set(slug, [regularImages[index % regularImages.length]].filter(Boolean));
  });

  if (soft16pm.length) {
    assignments.set('16promax', soft16pm);
  }

  for (const slug of IPHONE_OLED_SLUGS) {
    const targetDir = path.join(TARGET_ROOT, targetSeries, slug);
    ensureDir(targetDir);
    const assignedImages = assignments.get(slug) || [];
    if (assignedImages[0]) copyImageAsJpg(assignedImages[0], path.join(targetDir, 'main.jpg'));
    assignedImages.slice(1, 4).forEach((file, index) => {
      copyImageAsJpg(file, path.join(targetDir, `gallery-${String(index + 1).padStart(2, '0')}.jpg`));
    });
    const video = videosBySlug.get(slug);
    if (video) copyVideo(video, path.join(targetDir, 'video-01.mp4'));
  }
}

function syncSamsungIncell() {
  const sourceDir = path.join(SOURCE_ROOT, 'SAMSUNG INCELL');
  const groups = groupSamsungFiles(sourceDir);
  for (const [slug, group] of groups.entries()) {
    writeSamsungGroup('samsung-incell', slug, group);
  }
}

function syncSamsungOled() {
  const sourceDir = path.join(SOURCE_ROOT, 'SAMSUNG OLED');
  const groups = groupSamsungFiles(sourceDir);
  for (const [slug, group] of groups.entries()) {
    writeSamsungGroup('samsung-oled', slug, group);
  }
}

function main() {
  if (!exists(SOURCE_ROOT)) {
    throw new Error(`No existe la carpeta de materiales: ${SOURCE_ROOT}`);
  }
  syncIphoneOled();
  syncSamsungIncell();
  syncSamsungOled();
  console.log('Series assets synced.');
}

main();
