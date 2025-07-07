# Color Theme Extractor 

This is a browser-based color theme extraction tool that can extract the main color from the image and generate a complete color variation system. It is particularly suitable for generating website theme colors, color schemes of design systems, and other scenarios.

## Features

- 🎨 Intelligently extract the main color from the image
- 🔄 Automatically adjust the color to ensure visual comfort
- 🌈 Generate a complete color variant system:
  - Light and dark mode variants
  - Primary, secondary, and accent colors
  - Surface and background colors
  - On-colors for text and icons
- 💅 Output multiple formats:
  - RGB/RGBA values
  - CSS variables
  - Hexadecimal color code
- 🎬 Beautiful transition animations
- 🌗 Automatic dark mode support

## Demo

<div align="center">
  <video src="demo.mp4" width="100%" controls="controls" muted="muted" style="max-width:800px;">
  </video>
</div>

## Live Demo

Check out the live demo: [Color Theme Extractor](https://colorcatcher.vercel.app/)

## Usage

```typescript
import { ColorThemeExtractor } from 'color-theme-extractor';

const extractor = new ColorThemeExtractor();

// Extract color from image elements
const imageElement = document.querySelector('img');
const mainColor = await extractor.extractMainColor(imageElement);

// Generate a complete Material You theme scheme
const colorScheme = await extractor.generateThemeSchemeFromImage(imageElement);

// Apply the theme to your document
extractor.applyTheme(colorScheme, {
  target: document.body,
  dark: false // or true for dark mode
});
```

## Type Definitions

```typescript
interface RGB {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
}

interface HSL {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}
```

## License

MIT
