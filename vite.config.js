import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import obfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig({
  plugins: [
    react(),
    obfuscator({
      
      include: [
        'src/pages/**/*.jsx',
        'src/components/**/*.jsx',
        'src/context/**/*.jsx',
        'src/services/**/*.js',
        'src/App.jsx',
        'src/main.jsx'
      ],
    
      exclude: [/node_modules/],
      apply: 'build',
      options: {
        compact: true,
      
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
       
        numbersToExpressions: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        splitStringsChunkLength: 3,
       
        identifierNamesGenerator: 'hexadecimal',
      
        disableConsoleOutput: true,
       
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4
      }
    })
  ]
});
