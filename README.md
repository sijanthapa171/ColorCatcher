# Color Theme Extractor 

This is a browser-based color theme extraction tool that can extract the main color from the image and generate a complete color variation system. It is particularly suitable for generating website theme colors, color schemes of design systems, and other scenarios.

## characteristic

- 🎨 Intelligently extract the main color from the image
- 🔄 Automatically adjust the color to ensure visual comfort
- 🌈 Generate a complete color variant system:
- 8 light mode variants (red-0 to red-6, including red-5-5)
- 2 shadow color variants
- 5 dark mode variants
- 💅 Output multiple formats:
- RGB/RGBA values
- CSS variables
- Hexadecimal color code


### Use in projects

```typescript
import { ColorThemeExtractor } from 'color-theme-extractor';

const extractor = new ColorThemeExtractor();

// Extract color from image elements
const imageElement = document.querySelector('img');
const mainColor = await extractor.extractMainColor(imageElement);

// Adjust the color to make it more suitable as a theme color
const adjustedColor = extractor.adjustColor(mainColor);

// Generate a complete color scheme
const colorScheme = extractor.generateFullColorScheme(adjustedColor);
```

### type definition

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
