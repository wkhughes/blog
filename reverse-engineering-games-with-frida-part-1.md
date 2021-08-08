# Reverse Engineering Games with Frida (Part 1): Introduction to the Frida CLI and frida-trace

## Introduction

Recently I've started using [Frida](https://frida.re) to aid in reverse engineering of Windows games. Why Frida? My old workflow was to inject a C++ DLL containing my patches and hooks into the game, which meant *any* update (e.g. logging an extra parameter in a hook) involved ejecting the DLL, recompiling, and reinjecting. Compare to using Frida:
- **Quick prototyping**: Function hooks are scriptable. I can change what my hooks do just by updating some JS. Frida automatically updates the hooks inside the target process while it's running.
- **Exploration**: The Frida CLI provides a REPL inside of the target process. This provides an easy way to poke around its memory and structure.
- **Anti-anti-debugging**: Some games make it difficult to attach a debugger for reverse engineering. The quick prototyping and exploration tools of Frida provide an alternative.

## Installation

Installing Frida's CLI tools couldn't be more straight-forward. Assuming Python is already installed:

```
pip install frida-tools
```

See [Frida's installation docs](https://frida.re/docs/installation/) in case you run into issues.

## Using Frida CLI

Start a Frida session by providing the name or id of the target process:

```
frida Game.exe
```

### Exploring Frida

Frida drops us into a JS REPL. The [Frida JavaScript API](https://frida.re/docs/javascript-api/) can now be used to interact with the process. An example listing the imports of the main module:

```javascript
[Local::Game.exe]-> Module.load("Game.exe").enumerateImports()
[
    {
        "address": "0x76b923a0",
        "module": "KERNEL32.dll",
        "name": "GetTickCount",
        "type": "function"
    },
    {
        "address": "0x76b92e90",
        "module": "KERNEL32.dll",
        "name": "GetCurrentProcessId",
        "type": "function"
    },
    ...
```

The REPL can be exited with `quit`.

### Running Scripts
Let's hook `GetCurrentProcessID` (chosen arbitrarily) to inspect its invocations. As the code will be more than a few lines, we can ask Frida to load a script instead of manually entering into the REPL:
```
frida Game.exe -l frida-test-hook.js
``` 

`frida-test-hook.js`:
```javascript
Interceptor.attach(Module.getExportByName("kernel32.dll", "GetCurrentProcessId"), {
  onEnter(args) {
    this.handle = args[0].toInt32();
  },
  onLeave(retval) {
    console.log(`handle ${this.handle} -> pid ${retval.toInt32()}`);
  }
});
```

Switching back to the game to causes a few `GetCurrentProcessID` calls and triggers the hook, the result can be seen in the Frida session:
```
handle 1700316 -> pid 13848
handle 1701108 -> pid 13848
handle 1700396 -> pid 13848
```

Updates to the script can are applied in real time, without having to reload anything. For example, an updating to the logging to include the thread ID:
```javascript
console.log(`[${this.threadId}] handle ${this.handle} -> pid ${retval.toInt32()}`);
```

The result of which can be seen immediatly on the next `GetCurrentProcessID` call:
```
[13980] handle 1700316 -> pid 4404
```

## frida-trace


Frida provides the `frida-trace` tool that wrap these operations. To be continued...