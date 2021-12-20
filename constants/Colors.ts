const tintColorLight = 'red';
const tintColorDark = 'rgba(255, 255, 255, 0.85)';

export default {
  light: {
    text: 'rgba(0, 0, 0, 0.77)',
    text2: 'rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(0, 0, 0, 0.35)',
    borderLightColor: 'rgba(0, 0, 0, 0.09)',
    searchbarBackground: 'rgba(0, 0, 0, 0.05)',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    headerBackground: '#f8f8f8',
  },
  dark: {
    text: 'rgba(255, 255, 255, 0.85)',
    text2: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderLightColor: 'rgba(255, 255, 255, 0.11)',
    searchbarBackground: 'rgba(255, 255, 255, 0.08)',
    background: '#0c0c0c',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    headerBackground: '#181818',
    danger: '#CF6679',
  },
};
