// Asset imports resolve to a URL string (Bun's bundler copies the file).
declare module '*.svg' { const url: string; export default url }
declare module '*.png' { const url: string; export default url }
declare module '*.jpg' { const url: string; export default url }
declare module '*.webp' { const url: string; export default url }
declare module '*.woff2' { const url: string; export default url }
