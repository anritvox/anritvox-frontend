import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom Compile-Time Protection Engine
function anritvoxSecurityCore() {
  return {
    name: 'anritvox-bundle-protection-lock',
    enforce: 'post',
    renderChunk(code, chunk) {
      if (!chunk.fileName.endsWith('.js')) return null;

      // Anti-Tamper payload with hard domain restrictions and real-time DevTools crashers
      const systemProtectionShield = `
      (function(){
        const _0xAuthDomains = ["anritvox.com", "www.anritvox.com", "localhost"];
        const _0xCurrentHost = window.location.hostname;
        let _0xIsExecutionSafe = false;

        for (let i = 0; i < _0xAuthDomains.length; i++) {
          if (_0xCurrentHost === _0xAuthDomains[i] || _0xCurrentHost.endsWith("." + _0xAuthDomains[i])) {
            _0xIsExecutionSafe = true;
            break;
          }
        }

        if (!_0xIsExecutionSafe) {
          window.stop();
          try { document.documentElement.innerHTML = "<h1>Application Context Violations Detected. Execution Permanently Halted.</h1>"; } catch(e) {}
          setInterval(function(){ while(true){ eval("debugger"); } }, 5);
          throw new Error("Critical Security Fault: Host Domain Not Authorized.");
        }

        // Active Anti-Debugging and Console Profiling Protection Loops
        const _0xSentry = function() {};
        _0xSentry.toString = function() {
          window.stop();
          document.documentElement.innerHTML = "";
          setInterval(function(){ while(true){ eval("debugger"); } }, 5);
          return "";
        };
        
        setInterval(function() {
          try {
            console.log("%c", _0xSentry);
            console.clear();
          } catch(e) {}
        }, 250);

        setInterval(function() {
          const _0xCheckTimeStart = performance.now();
          eval("debugger");
          const _0xCheckTimeEnd = performance.now();
          if ((_0xCheckTimeEnd - _0xCheckTimeStart) > 100) {
            window.stop();
            document.documentElement.innerHTML = "";
            window.location.replace("about:blank");
          }
        }, 500);
      })();
      `;

      // Prepend the protection code directly ahead of the production code bundle chunk
      const protectedOutputCode = systemProtectionShield + "\n" + code;
      return { code: protectedOutputCode, map: null };
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    anritvoxSecurityCore()
  ],
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 3000, 
    rollupOptions: {
      output: {
        manualChunks: undefined 
      }
    }
  }
});
