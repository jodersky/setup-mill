const core = require('@actions/core');
const io = require('@actions/io');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {

  const millPath = `.mill-bin`;

  try {
    const millVersion = core.getInput('mill-version');
    
    var cachedMillPath = tc.find('mill', millVersion);
    if (!cachedMillPath) {
      core.info('no cached version found');
      core.info('downloading mill');
      const downloadPath = await tc.downloadTool(`https://github.com/lihaoyi/mill/releases/download/${millVersion}/${millVersion}-assembly`);
      await io.mkdirP(millPath);
      const targetPath = process.platform === 'win32' ? `${millPath}/mill.bat` : `${millPath}/mill`;
      await io.cp(downloadPath, targetPath, { force: true });
      fs.chmodSync(targetPath, '0755') // This shouldn't do anything on win32
      cachedMillPath = await tc.cacheDir(millPath, 'mill', millVersion);
    } else {
      core.info(`using cached version of mill: ${cachedMillPath}`);
    }
    core.addPath(cachedMillPath);

    // warm up mill, this populates ~/.mill
    // TODO: once caching across workflow invocations is available, this dorectory should be cached too
    //       (note that caching would only help for multiple jobs, as data is cached in the home directory
    //       which is shared across steps)
    const millOptions = process.platform === 'win32' ? [ '--no-server' ] : [];
    await exec.exec('mill', millOptions.concat(['version']));
  }
  catch (error) {
    core.setFailed(error.message);
  }

}

run()
