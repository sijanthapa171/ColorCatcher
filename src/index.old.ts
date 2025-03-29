export interface RGB {
   r: number;
   g: number;
   b: number;
 }
 
 export interface HSL {
   h: number;
   s: number;
   l: number;
 }
 
 declare global {
   interface Window {
     ColorThief: new () => {
       getColor(img: HTMLImageElement): [number, number, number];
       getPalette(img: HTMLImageElement, colorCount?: number): [number, number, number][];
     };
   }
 }
 
 export class ColorThemeExtractor {
   private colorThief: InstanceType<typeof window.ColorThief>;
 
   constructor() {
     this.colorThief = new window.ColorThief();
   }
 
   /**
    * Extract the main color from the image
    */
   async extractMainColor(imageSource: string | HTMLImageElement): Promise<RGB> {
     let img: HTMLImageElement;
     
     if (typeof imageSource === 'string') {
       img = new Image();
       img.crossOrigin = 'Anonymous';
       img.src = imageSource;
       await new Promise((resolve) => {
         img.onload = resolve;
       });
     } else {
       img = imageSource;
     }
 
     const color = this.colorThief.getColor(img);
     return { r: color[0], g: color[1], b: color[2] };
   }
 
   /**
    * RGB to HSL
    */
   private rgbToHsl(rgb: RGB): HSL {
     const r = rgb.r / 255;
     const g = rgb.g / 255;
     const b = rgb.b / 255;
 
     const max = Math.max(r, g, b);
     const min = Math.min(r, g, b);
     let h = 0;
     let s = 0;
     const l = (max + min) / 2;
 
     if (max !== min) {
       const d = max - min;
       s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
 
       switch (max) {
         case r:
           h = (g - b) / d + (g < b ? 6 : 0);
           break;
         case g:
           h = (b - r) / d + 2;
           break;
         case b:
           h = (r - g) / d + 4;
           break;
       }
       h /= 6;
     }
 
     return {
       h: h * 360,
       s: s * 100,
       l: l * 100
     };
   }
 
   /**
    * HSL Convert to RGB
    */
   private hslToRgb(hsl: HSL): RGB {
     const h = hsl.h / 360;
     const s = hsl.s / 100;
     const l = hsl.l / 100;
 
     let r: number, g: number, b: number;
 
     if (s === 0) {
       r = g = b = l;
     } else {
       const hue2rgb = (p: number, q: number, t: number) => {
         if (t < 0) t += 1;
         if (t > 1) t -= 1;
         if (t < 1/6) return p + (q - p) * 6 * t;
         if (t < 1/2) return q;
         if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
         return p;
       };
 
       const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
       const p = 2 * l - q;
 
       r = hue2rgb(p, q, h + 1/3);
       g = hue2rgb(p, q, h);
       b = hue2rgb(p, q, h - 1/3);
     }
 
     return {
       r: Math.round(r * 255),
       g: Math.round(g * 255),
       b: Math.round(b * 255)
     };
   }
 
   /**
    * Adjust color adaptivity
    * reference Material You color adjustment principles
    */
   adjustColor(color: RGB): RGB {
     // Convert to HSL for adjustment
     const hsl = this.rgbToHsl(color);
 
     // Make sure the saturation is within the appropriate range (40-80%)
     if (hsl.s < 40) hsl.s = 40;
     if (hsl.s > 80) hsl.s = 80;
 
     //Ensure moderate brightness (30-70%)
     if (hsl.l < 30) hsl.l = 30;
     if (hsl.l > 70) hsl.l = 70;
 
     // Convert back to RGB
     return this.hslToRgb(hsl);
   }
 
   /**
    * Generate color scheme
    */
   generateColorScheme(baseColor: RGB) {
     const hsl = this.rgbToHsl(baseColor);
     
     return {
       primary: baseColor,
       // Generate complementary colors
       complement: this.hslToRgb({
         h: (hsl.h + 180) % 360,
         s: hsl.s,
         l: hsl.l
       }),
       // Generate dark version
       dark: this.hslToRgb({
         h: hsl.h,
         s: hsl.s,
         l: Math.max(hsl.l - 20, 0)
       }),
       // Generate a bright version
       light: this.hslToRgb({
         h: hsl.h,
         s: hsl.s,
         l: Math.min(hsl.l + 20, 100)
       })
     };
   }
 
   /**
    * Generate a complete color variant scheme
    */
   generateFullColorScheme(baseColor: RGB) {
     const hsl = this.rgbToHsl(baseColor);
     
     // Generates a color scale of 0-6
     const lightVariants = {
       0: this.hslToRgb({ h: hsl.h, s: hsl.s, l: Math.max(hsl.l - 15, 0) }),
       1: this.hslToRgb({ h: hsl.h, s: hsl.s, l: Math.max(hsl.l - 10, 0) }),
       2: this.hslToRgb({ h: hsl.h, s: hsl.s, l: Math.max(hsl.l - 5, 0) }),
       3: baseColor, // main color
       4: this.hslToRgb({ h: hsl.h, s: Math.max(hsl.s - 10, 0), l: Math.min(hsl.l + 5, 100) }),
       5: this.hslToRgb({ h: hsl.h, s: Math.max(hsl.s - 15, 0), l: Math.min(hsl.l + 10, 100) }),
       "5-5": this.hslToRgb({ h: hsl.h, s: Math.max(hsl.s - 20, 0), l: Math.min(hsl.l + 15, 100) }),
       6: this.hslToRgb({ h: hsl.h, s: Math.max(hsl.s - 25, 0), l: Math.min(hsl.l + 20, 100) })
     };
 
     // generate dark shadows
     const shadowColors = {
       "red-3-shadow": this.hslToRgb({ h: hsl.h, s: Math.min(hsl.s + 10, 100), l: Math.max(hsl.l - 30, 0) }),
       "red-6-shadow": this.hslToRgb({ h: hsl.h, s: Math.min(hsl.s + 15, 100), l: Math.max(hsl.l - 25, 0) })
     };
 
     // Generate dark mode variants
     const darkModeVariants = {
       0: this.hslToRgb({ h: hsl.h, s: Math.max(hsl.s - 5, 0), l: Math.min(hsl.l + 5, 100) }),
       4: { ...this.hslToRgb({ h: hsl.h, s: hsl.s, l: 82 }), a: 0.5 },
       5: { ...this.hslToRgb({ h: hsl.h, s: hsl.s, l: 89 }), a: 0.15 },
       "5-5": { ...this.hslToRgb({ h: hsl.h, s: hsl.s, l: 93 }), a: 0.05 },
       6: { ...this.hslToRgb({ h: hsl.h, s: hsl.s, l: 95 }), a: 0.2 }
     };
 
     // Generate CSS variable format
     const cssVariables = {
       light: {
         ...Object.entries(lightVariants).reduce((acc, [key, color]) => ({
           ...acc,
           [`--red-${key}`]: `#${this.rgbToHex(color)}`
         }), {}),
         ...Object.entries(shadowColors).reduce((acc, [key, color]) => ({
           ...acc,
           [`--color-${key}`]: `#${this.rgbToHex(color)}`
         }), {})
       },
       dark: {
         "--red-0": `var(--red-1)`,
         "--red-4": `rgba(255, 208, 208, 0.5)`,
         "--red-5": `rgba(255, 228, 228, 0.15)`,
         "--red-5-5": `rgba(255, 236, 236, 0.05)`,
         "--red-6": `rgba(255, 243, 243, 0.2)`
       }
     };
 
     return {
       lightVariants,
       shadowColors,
       darkModeVariants,
       cssVariables
     };
   }
 
   /**
    * RGB to hexadecimal color
    */
   private rgbToHex(color: RGB): string {
     const toHex = (n: number) => {
       const hex = n.toString(16);
       return hex.length === 1 ? '0' + hex : hex;
     };
     return `${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
   }
 } 