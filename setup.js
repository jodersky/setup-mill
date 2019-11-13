const core = require('@actions/core');
const io = require('@actions/io');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {
  try {
    const millVersion = core.getInput('mill-version');
    
    var millPath = tc.find('mill', millVersion);
    if (!millPath) {
      core.info('no cached version found');
      core.info('downloading mill');
      const downloadPath = await tc.downloadTool(`https://github.com/lihaoyi/mill/releases/download/${millVersion}/${millVersion}-assembly`);
      await io.mkdirP('mill');
      await io.cp(downloadPath, 'mill/mill', { force: true });
      fs.chmodSync('mill/mill', '0755')
      millPath = await tc.cacheDir('mill', 'mill', millVersion);
    } else {
      core.info(`using cached version of mill: ${millPath}`);
    }
    core.addPath(millPath);

    // warm up mill, this populates ~/.mill
    // TODO: once caching across workflow invocations is available, this dorectory should be cached too
    //       (note that caching would only help for multiple jobs, as data is cached in the home directory
    //       which is shared across steps)
    await exec.exec('mill', ['version']);
  }
  catch (error) {
    core.setFailed(error.message);
  }

}

run()
