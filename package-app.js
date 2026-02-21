const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('开始打包应用...');

const distPath = path.join(__dirname, 'dist');
const distElectronPath = path.join(__dirname, 'dist-electron');
const releasePath = path.join(__dirname, 'release');

try {
  if (!fs.existsSync(releasePath)) {
    fs.mkdirSync(releasePath, { recursive: true });
  }

  console.log('检查构建文件...');
  if (!fs.existsSync(distPath) || !fs.existsSync(distElectronPath)) {
    console.error('请先运行构建命令: pnpm run build');
    process.exit(1);
  }

  console.log('使用electron-builder打包...');
  
  try {
    execSync('npx electron-builder --win --x64 --config electron-builder.json --dir', {
      stdio: 'inherit',
      cwd: __dirname,
      env: {
        ...process.env,
        CSC_IDENTITY_AUTO_DISCOVERY: 'false',
        ELECTRON_BUILDER_ALLOW_UNRESOLVED_VERSION: 'true'
      }
    });
  } catch (error) {
    console.log('electron-builder失败，尝试使用已构建的文件...');
    
    const electronPath = path.join(__dirname, 'node_modules', 'electron', 'dist');
    const appPath = path.join(releasePath, 'ai-assistant');
    
    if (fs.existsSync(appPath)) {
      console.log(`应用已构建在: ${appPath}`);
      console.log(`可执行文件: ${path.join(appPath, 'electron.exe')}`);
      return;
    }
    
    throw error;
  }
  
} catch (error) {
  console.error('打包失败:', error.message);
  process.exit(1);
}