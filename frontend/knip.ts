export default {
  ignore: [
    'next-env.d.ts',
    'tailwind.config.ts',
    'postcss.config.js',
    'next.config.mjs',
    'next.config.js'
  ],
  ignoreDependencies: [
    'eslint-config-next',
    '@types/node',
    '@types/react',
    '@types/react-dom',
    'autoprefixer',
    'postcss',
    'tailwindcss'
  ],
  next: {
    entry: [
      'src/app/**/{page,layout,loading,error,not-found,global-error,default,route}.{ts,tsx,js,jsx}',
      'src/middleware.{ts,tsx,js,jsx}'
    ]
  }
};
