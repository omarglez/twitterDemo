import { style } from 'react-toastify';

style({
    colorWarning: "#111111",
});

const themeProperties = [
    "--main-color",
    "--main-text-color",
    "--secondary-color",
    "--secondary-text-color",
    "--secondary-subcolor",
    "--secondary-text-subcolor",
    "--background-color",
    "--background-highlight-color",
    "--background-contrast-color",
    "--warning-color"
];

const defaultTheme = [
    "#5182ff",
    "#ffffff",
    "#111111",
    "#808080",
    "#404040",
    "#cccccc",
    "#e6e6e6",
    "#f2f2f2",
    "#ffffff",
    "#cccc00"
];

const otherTheme = [
    "#009900",
    "#ffffff",
    "#0024ff",
    "#00ff00",
    "#008000",
    "#99ff99",
    "#ccffcc",
    "#e5ffe5",
    "#ffffff",
    "#cccc00"
];

const themes = [defaultTheme, otherTheme];
const themeNames = ["default", "green"];

function applyTheme(themeName) {
    let index = themeNames.indexOf(themeName);
    let themeValues = [];

    if(index < 0) {
        return;
    }

    themeValues = themes[index];

    if(themeValues.length !== themeProperties.length) {
        return;
    }

    themeProperties.forEach((prop, i) => {
        document.documentElement.style.setProperty(prop, themeValues[i]);
    });

    style({
        colorWarning: themeValues[2] // --secondary-color,
    });
}

export {
    applyTheme
};
