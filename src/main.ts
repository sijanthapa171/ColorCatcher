import { ColorThemeExtractor } from "./index";

async function initApp() {
  const extractor = new ColorThemeExtractor();
  const imageInput = document.getElementById("imageInput") as HTMLInputElement;
  const imagePreview = document.getElementById("imagePreview") as HTMLImageElement;
  const colorSchemeContainer_light = document.getElementById(
    "light-colorScheme-container"
  );
  const colorSchemeContainer_dark = document.getElementById(
    "dark-colorScheme-container"
  );

  function createColorBlock(
    mainColor: number,
    onColor: number,
    mainColorName: string,
    onColorName: string,
    container: HTMLElement
  ) {
    const mainColorString = extractor.hexFromArgb(mainColor);
    const onColorString = extractor.hexFromArgb(onColor);

    const block = document.createElement("div");
    block.className = "color-block";
    block.style.backgroundColor = mainColorString;
    block.style.color = onColorString;
    block.textContent = `${mainColorName} ${mainColorString}\n${onColorName} ${onColorString}`;
    container.appendChild(block);
  }

  function createColorBlock2(
    mainColor: number,
    mainColorName: string,
    textColor: number,
    container: HTMLElement
  ) {
    const mainColorString = extractor.hexFromArgb(mainColor);
    const textColorString = extractor.hexFromArgb(textColor);

    const block = document.createElement("div");
    block.className = "color-block";
    block.style.backgroundColor = mainColorString;
    block.style.color = textColorString;
    block.textContent = `${mainColorName} ${mainColorString}`;
    container.appendChild(block);
  }

  function displayColorScheme(scheme: any) {
    colorSchemeContainer_light!.innerHTML = "";
    colorSchemeContainer_dark!.innerHTML = "";

    let defaultColor: number;

    defaultColor = scheme.schemes.light.props.primary;

    for (const [colorName, colorValue] of Object.entries(
      scheme.schemes.light.props
    )) {
      if (!colorName.startsWith("on")) {
        const onColorName = `on${colorName
          .charAt(0)
          .toUpperCase()}${colorName.slice(1)}`;
        const onColorValue = scheme.schemes.light[onColorName];
        if (onColorValue !== undefined) {
          if (colorValue === onColorValue) {
            createColorBlock2(
              colorValue as number,
              colorName,
              defaultColor,
              colorSchemeContainer_light!
            );
          } else {
            createColorBlock(
              colorValue as number,
              onColorValue as number,
              colorName,
              onColorName,
              colorSchemeContainer_light!
            );
          }
        } else {
          createColorBlock2(
            colorValue as number,
            colorName,
            defaultColor,
            colorSchemeContainer_light!
          );
        }
      }
    }

    defaultColor = scheme.schemes.dark.props.primary;

    for (const [colorName, colorValue] of Object.entries(
      scheme.schemes.dark.props
    )) {
      if (!colorName.startsWith("on")) {
        const onColorName = `on${colorName
          .charAt(0)
          .toUpperCase()}${colorName.slice(1)}`;
        const onColorValue = scheme.schemes.dark[onColorName];
        if (onColorValue !== undefined) {
          if (colorValue === onColorValue) {
            createColorBlock2(
              colorValue as number,
              colorName,
              defaultColor,
              colorSchemeContainer_dark!
            );
          } else {
            createColorBlock(
              colorValue as number,
              onColorValue as number,
              colorName,
              onColorName,
              colorSchemeContainer_dark!
            );
          }
        } else {
          createColorBlock2(
            colorValue as number,
            colorName,
            defaultColor,
            colorSchemeContainer_dark!
          );
        }
      }
    }

    // Apply the theme to the document body
    extractor.applyTheme(scheme, {
      target: document.body,
      dark: false
    });
  }

  imageInput.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async function (e: ProgressEvent<FileReader>) {
        if (e.target?.result) {
          imagePreview.src = e.target.result as string;
          imagePreview.onload = async () => {
            const startTime = performance.now();
            const scheme = await extractor.generateThemeSchemeFromImage(imagePreview);
            const endTime = performance.now();
            const timeElement = document.getElementById("time");
            if (timeElement) {
              timeElement.textContent = `Time taken: ${Math.round(
                endTime - startTime
              )}ms`;
            }
            displayColorScheme(scheme);
          };
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

// Start the application
initApp().catch(console.error); 