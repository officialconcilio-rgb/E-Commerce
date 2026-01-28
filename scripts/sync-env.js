const fs = require('fs');
const path = require('path');

const rootEnvPath = path.join(__dirname, '../.env');
const appsDir = path.join(__dirname, '../apps');

if (!fs.existsSync(rootEnvPath)) {
    console.error('Root .env file not found!');
    process.exit(1);
}

const apps = ['api-server', 'storefront', 'admin-panel'];

apps.forEach(app => {
    const appDir = path.join(appsDir, app);
    if (fs.existsSync(appDir)) {
        const targetPath = (app === 'api-server') ? path.join(appDir, '.env') : path.join(appDir, '.env.local');
        fs.copyFileSync(rootEnvPath, targetPath);
        console.log(`Synced .env to ${app}/${path.basename(targetPath)}`);
    }
});
