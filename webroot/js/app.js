let callbackCounter = 0;
function getUniqueCallbackName(prefix) {
  return `${prefix}_callback_${Date.now()}_${callbackCounter++}`;
}

function exec(command, options) {
  if (typeof options === "undefined") {
    options = {};
  }

  return new Promise((resolve, reject) => {
    // Generate a unique callback function name
    const callbackFuncName = getUniqueCallbackName("exec");

    // Define the success callback function
    window[callbackFuncName] = (errno, stdout, stderr) => {
      resolve({ errno, stdout, stderr });
      cleanup(callbackFuncName);
    };

    function cleanup(successName) {
      delete window[successName];
    }

    try {
      ksu.exec(command, JSON.stringify(options), callbackFuncName);
    } catch (error) {
      reject(error);
      cleanup(callbackFuncName);
    }
  });
}

function Stdio() {
    this.listeners = {};
  }
  
  Stdio.prototype.on = function (event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  };
  
  Stdio.prototype.emit = function (event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => listener(...args));
    }
  };
  
  function ChildProcess() {
    this.listeners = {};
    this.stdin = new Stdio();
    this.stdout = new Stdio();
    this.stderr = new Stdio();
  }
  
  ChildProcess.prototype.on = function (event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  };
  
  ChildProcess.prototype.emit = function (event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => listener(...args));
    }
  };
  
 function spawn(command, args, options) {
    if (typeof args === "undefined") {
      args = [];
    } else if (typeof args === "object") {
        // allow for (command, options) signature
        options = args;
    }
    
    if (typeof options === "undefined") {
      options = {};
    }
  
    const child = new ChildProcess();
    const childCallbackName = getUniqueCallbackName("spawn");
    window[childCallbackName] = child;
  
    function cleanup(name) {
      delete window[name];
    }

    child.on("exit", code => {
        cleanup(childCallbackName);
    });

    try {
      ksu.spawn(
        command,
        JSON.stringify(args),
        JSON.stringify(options),
        childCallbackName
      );
    } catch (error) {
      child.emit("error", error);
      cleanup(childCallbackName);
    }
    return child;
  }

function fullScreen(isFullScreen) {
  ksu.fullScreen(isFullScreen);
}

function toast(message) {
  ksu.toast(message);
}

// kernelsu.js

async function start_service () {
    await exec("/data/adb/modules/uperf_for_kirin970/tools/start.sh");
}

async function kill_service () {
    await exec("/data/adb/modules/uperf_for_kirin970/tools/kill.sh");
}


async function apply_config (k,v) {
    await exec(`/data/adb/modules/uperf_for_kirin970/tools/apply.sh ${k} ${v}`);
}

async function get_config (k) {
    const { stdout } = await exec(`/data/adb/modules/uperf_for_kirin970/tools/get.sh ${k}`);
    if (k==="sf") {}
    if (k==="log") {}
}

itv_stu=setInterval(update_statu,2000);
async function update_statu () {
    const tag= document.getElementById("statu");
    const { errno } = await exec("/data/adb/modules/uperf_for_kirin970/tools/statu.sh");
    if (errno === 0) {
        tag.setAttribute("class","badge rounded-pill text-bg-success");
        tag.innerText = "运行中";
    }
    else if (errno === 255) {
        tag.setAttribute("class","badge rounded-pill text-bg-secondary");
        tag.innerText = "未运行";
    }
}

itv_log=setInterval(update_output,5000);
txt=document.getElementById("output")
async function update_output () {
    const path=get_config ("log")
    const { stdout } = await exec(`cat ${path}`);
    txt.setAttribute("value",`${stdout}`)
}
