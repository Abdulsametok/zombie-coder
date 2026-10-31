const { spawn, execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function getSdkRoot() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk')
      : null,
  ].filter(Boolean);

  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  return candidates[0] || '';
}

function main() {
  const sdkRoot = getSdkRoot();
  const isWin = process.platform === 'win32';
  const emulatorBin = sdkRoot
    ? path.join(sdkRoot, 'emulator', isWin ? 'emulator.exe' : 'emulator')
    : 'emulator';

  let avds = [];
  try {
    const out = execFileSync(emulatorBin, ['-list-avds'], {
      encoding: 'utf8',
    });
    avds = out
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
  } catch (err) {
    console.error('Android emulator bulunamadi veya calistirilamadi:', err.message);
    process.exit(1);
  }

  if (avds.length === 0) {
    console.error('Kayitli bir Android Virtual Device (AVD) bulunamadi.');
    process.exit(1);
  }

  const requestedAvd = process.argv[2] || process.env.ANDROID_AVD || avds[0];
  console.log(`[ZombieCoder] Baslatiliyor: ${requestedAvd} (Mevcut AVD'ler: ${avds.join(', ')})`);

  const child = spawn(emulatorBin, ['-avd', requestedAvd], {
    stdio: 'inherit',
  });

  child.on('exit', code => {
    process.exit(code ?? 0);
  });
}

main();
