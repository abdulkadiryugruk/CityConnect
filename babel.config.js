export const presets = ['module:metro-react-native-babel-preset'];
export const plugins = [
  'react-native-reanimated/plugin',
];
export const env = {
  development: {
    plugins: [
      [
        '@babel/plugin-transform-class-properties',
        {
          loose: true,
        },
      ],
      [
        '@babel/plugin-transform-private-methods',
        {
          loose: true,
        },
      ],
      [
        '@babel/plugin-transform-private-property-in-object',
        {
          loose: true,
        },
      ],
    ],
  },
};
