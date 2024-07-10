import { globSync } from 'fast-glob';
import fs from 'node:fs/promises';
import { basename } from 'node:path';
import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss';

const iconPaths = globSync('./icons/*.svg');

const collectionName = 'blitz';

const customIconCollection = iconPaths.reduce(
  (acc, iconPath) => {
    const [iconName] = basename(iconPath).split('.');

    acc[collectionName] ??= {};
    acc[collectionName][iconName] = async () => fs.readFile(iconPath, 'utf8');

    return acc;
  },
  {} as Record<string, Record<string, () => Promise<string>>>,
);

const COLOR_PRIMITIVES = {
  accent: {
    DEFAULT: '#1389FD',
    50: '#EEF9FF',
    100: '#D8F1FF',
    200: '#B9E7FF',
    300: '#89DBFF',
    400: '#52C5FF',
    500: '#2AA7FF',
    600: '#1389FD',
    700: '#0C70E9',
    800: '#115ABC',
    900: '#144D94',
    950: '#11305A',
  },
  gray: {
    0: '#FFFFFF',
    50: '#F6F8F9',
    100: '#EEF0F1',
    200: '#E4E6E9',
    300: '#D2D5D9',
    400: '#AAAFB6',
    500: '#7C8085',
    600: '#565A64',
    700: '#414349',
    800: '#31343B',
    900: '#2B2D35',
    950: '#232429',
    1000: '#000000',
  },
  positive: {
    50: '#EDFCF6',
    100: '#CEFDEB',
    200: '#A1F9DC',
    300: '#64F1CB',
    400: '#24E0B3',
    500: '#02C79F',
    600: '#00A282',
    700: '#00826B',
    800: '#006656',
    900: '#005449',
    950: '#223533',
  },
  negative: {
    50: '#FEF2F3',
    100: '#FDE6E7',
    200: '#FBD0D4',
    300: '#F7AAB1',
    400: '#F06A78',
    500: '#E84B60',
    600: '#D42A48',
    700: '#B21E3C',
    800: '#951C38',
    900: '#801B36',
    950: '#45212A',
  },
  info: {
    50: '#EFF9FF',
    100: '#E5F6FF',
    200: '#B6E9FF',
    300: '#75DAFF',
    400: '#2CC8FF',
    500: '#00AEF2',
    600: '#008ED4',
    700: '#0071AB',
    800: '#005F8D',
    900: '#064F74',
    950: '#17374A',
  },
  warning: {
    50: '#FEFAEC',
    100: '#FCF4D9',
    200: '#F9E08E',
    300: '#F6CA53',
    400: '#ED9413',
    500: '#D2700D',
    600: '#AE4E0F',
    700: '#AE4E0F',
    800: '#8E3D12',
    900: '#753212',
    950: '#402C22',
  },
};

export default defineConfig({
  theme: {
    colors: {
      ...COLOR_PRIMITIVES,
      bolt: {
        elements: {
          app: {
            backgroundColor: 'var(--bolt-elements-app-backgroundColor)',
          },
        },
      },
    },
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno({
      dark: {
        light: '[data-theme="light"]',
        dark: '[data-theme="dark"]',
      },
    }),
    presetIcons({
      warn: true,
      collections: {
        ...customIconCollection,
      },
    }),
  ],
});
