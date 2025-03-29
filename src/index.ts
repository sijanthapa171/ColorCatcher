import {
  hexFromArgb,
  themeFromSourceColor,
  applyTheme,
} from "@material/material-color-utilities";
import ColorThief from "colorthief";

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

// Make sure to insert the style after the DOM is loaded
function injectViewTransitionStyles() {
  if (document.head.querySelector('#view-transition-styles')) return;

  const style = document.createElement("style");
  style.id = "view-transition-styles";
  style.textContent = `
      ::view-transition-new(root),
      ::view-transition-old(root) {
          animation: none !important;
      }
      body.apply-bg::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: var(--temp-bg-color);
          z-index: -1;
      }
      .reverse-bg::view-transition-old(root) {
          z-index: 100 !important;
      }
  `;
  
// Use a more reliable insertion method
  if (document.head.firstChild) {
      document.head.insertBefore(style, document.head.firstChild);
  } else {
      document.head.appendChild(style);
  }
}
export class ColorThemeExtractor {
  private colorThief: ColorThief;

  constructor() {
    this.colorThief = new ColorThief();

// Add a style tag at the end of the title to support subsequent custom animations
    injectViewTransitionStyles();
  }

  hexFromArgb(argb: number) {
    return hexFromArgb(argb);
  }

  private transitionAnimate = (reverse = false) => {
    let startX;
    let startY;
    if (reverse) {
      startX = window.innerWidth;
      startY = 0;
    } else {
      startX = 0;
      startY = 0;
    }

 // Calculate the radius, with the mouse click position as the center of the circle and the largest distance from the four corners as the radius
    const radius = Math.hypot(
      Math.max(startX, innerWidth - startX),
      Math.max(startY, innerHeight - startY)
    );
    const clipPath = [
      `circle(0% at ${startX}px ${startY}px)`,
      `circle(${radius}px at ${startX}px ${startY}px)`,
    ];
// Custom animation
    document.documentElement.animate(
      {
// If we want to switch to a dark theme, we start with a circle with a radius of 100% and end with a circle with a radius of 0% during the transition
        clipPath: reverse ? clipPath.reverse() : clipPath,
      },
      {
        duration: 350,
        // If we want to switch to a dark theme, we should clip the content of view-transition-old(root)
        pseudoElement: reverse
          ? "::view-transition-old(root)"
          : "::view-transition-new(root)",
      }
    );
  };

  applyTheme(
    theme: any,
    options?: {
      dark?: boolean;
      target?: HTMLElement;
      brightnessSuffix?: boolean;
      paletteTones?: number[];
    }
  ): void {

    const transition = document.startViewTransition(() => {
     // Modify the DOM state in startViewTransition to generate animation
      applyTheme(theme, options);

      document.body.classList.add("apply-bg");
      // Set the background color of the pseudo element
      const bgColor = this.hexFromArgb(
        theme.schemes.light.props.primaryContainer
      );
      document.body.style.setProperty("--temp-bg-color", bgColor);
    });

    transition.ready.then(() => {
      this.transitionAnimate();
    });

    transition.finished.then(() => {

      setTimeout(() => {
        document.documentElement.classList.add("reverse-bg");

        const transition2 = document.startViewTransition(() => {
          const bgColor = this.hexFromArgb(
            theme.schemes.light.props.background
          );
          document.body.style.setProperty("--temp-bg-color", bgColor);
        });
        transition2.ready.then(() => {
          this.transitionAnimate(true);
        });
        transition2.finished.then(() => {
          document.documentElement.classList.remove("reverse-bg");
        });
      }, 350);
    });
  }

  /**
   * Extract the main color from the image
   */
  async extractMainColor(imageSource: string | HTMLImageElement): Promise<RGB> {
    let img: HTMLImageElement;

    if (typeof imageSource === "string") {
      img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageSource;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
    } else {
      img = imageSource;
    }

    const color = await this.colorThief.getColor(img);
    if (!color) {
      throw new Error("Failed to extract main color");
    }
    return { r: color[0], g: color[1], b: color[2] };
  }

  /**
   *Use the color of the material you
   */

  generateThemeScheme(baseColor: RGB) {
    const source = (baseColor.r << 16) | (baseColor.g << 8) | baseColor.b;

    return themeFromSourceColor(source);
  }

  async generateThemeSchemeFromImage(imageSource: string | HTMLImageElement) {
    const baseColor = await this.extractMainColor(imageSource);
    return this.generateThemeScheme(baseColor);
  }
}

export default ColorThemeExtractor;
