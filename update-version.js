// update-version.js
const fs = require('fs');
const path = require('path');

// Baca file package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Baca file app.json
const appPath = path.join(__dirname, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appPath, 'utf8'));

// Ambil arguments dari command line
// node update-version.js minor
const versionType = process.argv[2] || 'patch';

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Update versi berdasarkan type
let newVersion;
if (versionType === 'patch') {
  newVersion = `${major}.${minor}.${patch + 1}`;
} else if (versionType === 'minor') {
  newVersion = `${major}.${minor + 1}.0`;
} else if (versionType === 'major') {
  newVersion = `${major + 1}.0.0`;
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

// Update app.json
appJson.expo.version = newVersion;

// Increment versionCode for Android
if (appJson.expo.android && appJson.expo.android.versionCode) {
  appJson.expo.android.versionCode += 1;
} else if (appJson.expo.android) {
  appJson.expo.android.versionCode = 3; // Asumsi versi sebelumnya 2
}

fs.writeFileSync(appPath, JSON.stringify(appJson, null, 2));

console.log(`✅ Version updated to ${newVersion}`);
console.log(`✅ Android versionCode updated to ${appJson.expo.android.versionCode}`);