# Fixing Frida "Failed to attach" Error

## Introduction

As shown in my post [Reverse Engineering Games with Frida (Part 1)](reverse-engineering-games-with-frida-part-1.md), the usual way to start a Frida session is by providing the name or id of the target process:

```
frida Game.exe
```

This will work for most processes. However for a game I was targeting Frida returned this error:

```
Failed to attach: process with pid 10232 either refused to load frida-agent, or terminated during injection
```

## Manual Injection

To work around this, it's possible to tell Frida to connect to an already-injected DLL instead of relying on its own injection.

### Injecting Frida-Gadget

Head to [Frida releases](https://github.com/frida/frida/releases) and download the appropriate latest frida-gadget DLL for the target platform, which in my case was [frida-gadget-14.2.18-windows-x86_64.dll.xz](https://github.com/frida/frida/releases/download/14.2.18/frida-gadget-14.2.18-windows-x86_64.dll.xz). After extracting, inject this into the process manually using a DLL injector. I used my own [Injector](https://github.com/wkhughes/Injector), but any will work:

![DLL injector](resources/frida-gadget-inject.png)

### Remote Connection

Tell Frida to connect the already-injected DLL using the `-R` (or `--remote`) option:

```
frida -R 10232
```

And Frida successfully connects to the process!

###  A Process Has No Name

Note that I provided a process ID this time instead of a name. When I tried to provide the process name with the remote option (`frida -R Game.exe`) Frida returned another failure:

```
Failed to spawn: unable to find process with name 'Game.exe'
```

I'm not sure why name resolution fails when used with the remote option, but it's easy enough to work around. Frida itself provides [frida-ps](https://frida.re/docs/frida-ps/) to list process names and IDs. I opted to use PowerShell to get the ID from the name:

```
frida -R (ps Game).id
```

## Conclusion
I'm not exactly sure of the injection method Frida uses that can cause incompatibility with certain games, but I hope this workaround can help others out who come across the same issue!