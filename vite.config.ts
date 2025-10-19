import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkEmoji from 'remark-emoji'
import rehypePrettyCode from 'rehype-pretty-code'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // Set base to '/blog/' for production builds
  // This ensures all asset paths are /blog/assets/* instead of /assets/*
  base: '/blog/',
  server: {
    port: 3000,
    strictPort: false,
  },
  plugins: [
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkGfm,
        remarkEmoji,
      ],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: 'github-dark-dimmed',
            keepBackground: false,
            onVisitLine(node: any) {
              if (node.children.length === 0) {
                node.children = [{ type: 'text', value: ' ' }];
              }
            },
            onVisitHighlightedLine(node: any) {
              node.properties.className.push('highlighted');
            },
            onVisitHighlightedWord(node: any) {
              node.properties.className = ['word'];
            },
          },
        ],
      ],
      providerImportSource: '@mdx-js/react',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown-vendor': ['react-markdown', 'gray-matter'],
        },
      },
    },
  },
})
