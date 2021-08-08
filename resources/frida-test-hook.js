Interceptor.attach(Module.getExportByName("kernel32.dll", "GetCurrentProcessId"), {
  onEnter(args) {
    this.handle = args[0].toInt32();
  },
  onLeave(retval) {
    console.log(`[${this.threadId}] handle ${this.handle} -> pid ${retval.toInt32()}`);
  }
});