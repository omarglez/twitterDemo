import { style } from 'react-toastify';

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

const gotham = [
    "#5983a6",
    "#dee6ed",
    "#0d1a26",
    "#4080bf",
    "#21415f",
    "#b4cde4",
    "#dbe5f0",
    "#edf2f7",
    "#f5faff",
    "#cccc00"
];

// TODO: Make theme less ugly.
const aqua = [
    "#008080",
    "#FFEFD5",
    "#2F4F4F",
    "#F5F5DC",
    "#A9A9A9",
    "#8B4513",
    "#5F9EA0",
    "#AFEEEE",
    "#F0F8FF",
    "#cccc00"
];

const themes = [defaultTheme, gotham, aqua];
const themeNames = ["default", "gotham", "aqua"];

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
