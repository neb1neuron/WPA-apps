let root = document.querySelector(':root');
let html = document.querySelector('html');
let btnThemeIcon = document.getElementById('btnThemeIcon');
let appStatusBox = document.getElementById('appSetup.status');
let appTargetBox = document.getElementById('appTarget');

export class ThemeHelper {
    // Get the root element

    // Create a function for getting a variable value
    static getCssVariable(cssVariableName) {
        // Get the styles (properties and values) for the root
        var rs = getComputedStyle(root);
        // console.log(`The value of ${cssVariableName} is: ` + rs.getPropertyValue(cssVariableName));
    }

    // Create a function for setting a variable value
    static setCssVariable(cssVariableName, value) {
        // Set the value of variable --blue to another value (in this case "lightblue")
        root.style.setProperty(cssVariableName, value);
    }

    static setDarkTheme() {
        html.setAttribute('data-bs-theme', "dark");
        this.setCssVariable('--bodyBackgroundColor', 'black');
        btnThemeIcon.className = 'bi bi-lightbulb';
    }

    static setLightTheme() {
        html.removeAttribute('data-bs-theme');
        this.setCssVariable('--bodyBackgroundColor', 'rgb(240 240 240)');
        btnThemeIcon.className = 'bi bi-lightbulb-off';
    }

    static toggleTheme() {
        const isDarkTheme = html.getAttribute('data-bs-theme');

        if (isDarkTheme) {
            this.setLightTheme();
        } else {
            this.setDarkTheme();
        }
    }

    static toggleAppStatusBox(sStatus) {

        appStatusBox.innerHTML = sStatus;
        if (sStatus === appStatusEnum.offline) {
            appStatusBox.style.setProperty('background-color', 'rgb(255, 60, 0)');
        } else if (sStatus === appStatusEnum.simulation) {
            appStatusBox.style.setProperty('background-color', 'rgb(166, 255, 0)');
        } else if (sStatus === appStatusEnum.simulationLowBudget) {
            appStatusBox.style.setProperty('background-color', 'rgb(255, 140, 0)');
        } else if (sStatus === appStatusEnum.online) {
            appStatusBox.style.setProperty('background-color', 'rgb(0, 255, 42)');
        } else if (sStatus === appStatusEnum.onlineLowBudget) {
            appStatusBox.style.setProperty('background-color', 'rgb(255, 140, 0)');
        } else if (sStatus === appStatusEnum.paused) {
            appStatusBox.style.setProperty('background-color', 'rgb(176, 203, 219)');
        }
    }

    static toggleAppTargetBox(nPort) {

        if (nPort === 8000) {
            appTargetBox.innerHTML = "DEVELOPMENT";
            appTargetBox.style.setProperty('background-color', 'rgb(166, 255, 0)');
        }
        else if (nPort === 8501) {
            appTargetBox.innerHTML = "PRODUCTION";
            appTargetBox.style.setProperty('background-color', 'rgb(255, 60, 0)');
        }

    }
}