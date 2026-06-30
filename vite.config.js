import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function anritvoxSecurityCore() {
  return {
    name: 'anritvox-bundle-protection-lock',
    enforce: 'post',
    renderChunk(code, chunk) {
      if (!chunk.fileName.endsWith('.js')) return null;

      const systemProtectionShield = `
      (function(){
        const _0xCurrentHost = window.location.hostname;
        
        // 1. Automatic Safe Mode for Local Host Loopbacks and Private Subnets (192.168.X.X, 10.X.X.X, etc.)
        const _0xIsLocalNetwork = /^localhost$|^127(?:\\.\\d+){3}$|^(?:10|192\\.168|172\\.(?:1[6-9]|2\\d|3[01]))\\./.test(_0xCurrentHost);
        
        // 2. Production Authorized Domains Matrix
        const _0xAuthDomains = ["anritvox.com", "www.anritvox.com", "vercel.app"];
        let _0xIsExecutionSafe = _0xIsLocalNetwork;

        if (!_0xIsExecutionSafe) {
          for (let i = 0; i < _0xAuthDomains.length; i++) {
            if (_0xCurrentHost === _0xAuthDomains[i] || _0xCurrentHost.endsWith("." + _0xAuthDomains[i])) {
              _0xIsExecutionSafe = true;
              break;
            }
          }
        }

        // 3. Declarative Teardown Execution (Non-blocking Thread Security)
        if (!_0xIsExecutionSafe) {
          try {
            window.stop();
            localStorage.clear();
            sessionStorage.clear();
          } catch(e) {}
          
          try {
            document.documentElement.innerHTML = "<h1>Application Context Violations Detected. Execution Permanently Halted.</h1>";
          } catch(e) {}
          
          window.location.replace("about:blank");
          throw new Error("Critical Security Fault: Host Domain Not Authorized.");
        }

        // 4. Safe Non-Blocking Anti-Debugging Instrumentation
        let _0xCounter = 0;
        const _0xVerifyRuntime = function() {
          const _0xCheckTimeStart = performance.now();
          eval("debugger");
          const _0xCheckTimeEnd = performance.now();
          if ((_0xCheckTimeEnd - _0xCheckTimeStart) > 100) {
            _0xCounter++;
            if (_0xCounter > 2) {
              try {
                window.stop();
                document.documentElement.innerHTML = "";
                window.location.replace("about:blank");
              } catch(e) {}
            }
          }
        };

        // Regulate profiling verifications smoothly without over-allocating internal event loops
        setInterval(_0xVerifyRuntime, 2000);
      })();
      `;

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
