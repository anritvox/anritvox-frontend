import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import obfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig({
  plugins: [
    react(),
    obfuscator({
      include: [
        'src/**/*.jsx', 
        'src/**/*.js'
      ],
      exclude: [/node_modules/],
      apply: 'build',
      options: {
        compact: true,
        // Maintains logical scrambling without breaking React renders
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        
        // CRITICAL FIX: Disabled to prevent the "primitive value" React crash
        splitStrings: false, 
        numbersToExpressions: false, 
        
        // Keeps names and text hidden safely
        stringArray: true,
        stringArrayShuffle: true,
        identifierNamesGenerator: 'hexadecimal',
        
        // Injects fake logic to confuse reverse-engineering
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.2,
        disableConsoleOutput: true
      }
    })
  ]
});
