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
  
  if (document.head.firstChild) {
      document.head.insertBefore(style, document.head.firstChild);
  } else {
      document.head.appendChild(style);
  }
}
export class ColorThemeExtractor {
  private colorThief: ColorThief;
  private needTransition: boolean;

  constructor({
    needTransition = true,
  } = {}) {
    this.colorThief = new ColorThief();
    this.needTransition = needTransition;

    if (needTransition) {
      injectViewTransitionStyles();
    }
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

    const radius = Math.hypot(
      Math.max(startX, innerWidth - startX),
      Math.max(startY, innerHeight - startY)
    );
    const clipPath = [
      `circle(0% at ${startX}px ${startY}px)`,
      `circle(${radius}px at ${startX}px ${startY}px)`,
    ];
    document.documentElement.animate(
      {
        clipPath: reverse ? clipPath.reverse() : clipPath,
      },
      {
        duration: 350,
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

    if (!this.needTransition) {
      applyTheme(theme, options);
      return;
    }

    const transition = document.startViewTransition(() => {
      applyTheme(theme, options);

      document.body.classList.add("apply-bg");
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
