const { spawn } = require('child_process');
const path = require('path');

function main() {
  const isWin = process.platform === 'win32';
  const androidDir = path.join(__dirname, '..', 'android');
  const gradleCmd = isWin ? 'gradlew.bat' : './gradlew';

  console.log('[ZombieCoder] Android App Bundle (AAB) derleniyor (bundleRelease)...');

  const child = spawn(gradleCmd, ['bundleRelease'], {
    cwd: androidDir,
    stdio: 'inherit',
    shell: isWin,
  });

  child.on('exit', code => {
    if (code === 0) {
      const aabPath = path.join(
        androidDir,
        'app',
        'build',
        'outputs',
        'bundle',
        'release',
        'app-release.aab',
      );
      console.log(`\n[ZombieCoder] AAB basariyla olusturuldu: ${aabPath}`);
    }
    process.exit(code ?? 0);
  });
}

main();
