# Reverse Engineering Games with Frida (Part 1): Introduction to the Frida CLI

part 2 - frida trace

## Introduction

Why Frida? Prototyping and exploration. Used to add hook code, recompile a DLL, reinject the DLL

A lot of that can be done with a debugger, but also: Anti debugging

## Installation

Installing Frida's CLI tools couldn't be more straight-forward. Assuming Python is already installed:

```
pip install frida-tools
```

See [Frida's installation docs](https://frida.re/docs/installation/) in case you run into issues

## Using Frida CLI

Start a Frida session by providing the name or id of the target process:

```
frida Game.exe
```

### Manual Injection

If the above command worked for you (it will for most processes), you can skip this section. However for the game I was targeting Frida returned this error:

```
Failed to attach: process with pid 10232 either refused to load frida-agent, or terminated during injection
```

To work around this, it's possible to tell Frida to connect to an already-injected DLL instead of relying on its own injection.

#### Injecting Frida-Gadget

Head to [Frida releases](https://github.com/frida/frida/releases) and download the appropriate latest frida-gadget DLL for your platform, which in my case was [frida-gadget-14.2.18-windows-x86_64.dll.xz](https://github.com/frida/frida/releases/download/14.2.18/frida-gadget-14.2.18-windows-x86_64.dll.xz). After extracting, inject this into the process manually using a DLL injector. I used my own [Injector](https://github.com/wkhughes/Injector), but any will work:

![DLL injector](frida-gadget-inject.png)

#### Remote Connection

Tell Frida to connect the already-injected DLL using the `-R` (or `--remote`) option:

```
frida -R 10232
```

And Frida successfully connects to the process!

#### That's Not My Name

Note that I provided a process ID this time instead of a name. When I tried to provide the process name with the remote option (`frida -R Game.exe`) Frida returned another failure:

```
Failed to spawn: unable to find process with name 'Game.exe'
```

I'm not sure why name resolution fails when used with the remote option, but it's easy enough to work around. Frida itself provides [frida-ps](https://frida.re/docs/frida-ps/) to list process names and IDs. I opted to use PowerShell to get the ID from the name:

```
frida -R (ps game).id
```

### Exploring Frida

Frida drops us into a JS REPL. Let's intercept a function:

Frida provides the `frida-trace` tool that wrap these operations.

We'll come back to this later.

## frida-trace
