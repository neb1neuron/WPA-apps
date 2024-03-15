export default class SnackBar {
    static snackBarContainer = document.getElementById("snackbar-container");
    static timeout = 5000;

    static snackBarIds = [];

    static snackBarTypes = {
        success: 'bg-success',
        info: 'bg-primary',
        warning: 'bg-warning text-dark',
        error: 'bg-danger'
    }

    static showSuccess(message) {
        this.createSnackBar(this.snackBarTypes.success, message);

    }

    static showInfo(message) {
        this.createSnackBar(this.snackBarTypes.info, message);
    }

    static showWarning(message) {
        this.createSnackBar(this.snackBarTypes.warning, message);
    }

    static showError(message) {
        this.createSnackBar(this.snackBarTypes.error, message);
    }

    static setHideTimer(snackBarId) {
        setTimeout(() => {
            if (document.getElementById(snackBarId)) document.getElementById(snackBarId).outerHTML = "";
        }, this.timeout);
    }

    static hideSnackBar(elem) {
        elem.outerHTML = "";
    }

    static createSnackBar(type, message) {
        const snackBarId = `snackBar-${this.snackBarIds.length + 1}`;
        const snackBar = `<div id="${snackBarId}"
                 onclick="SnackBar.hideSnackBar(this)"
                 class="snackbar-item ${type}">
                  <span class="snack-close"><i class="bi bi-x"></i></span>
                  <div class="snack-body">${message}</div>
            </div>`;
        this.snackBarContainer.innerHTML = snackBar + this.snackBarContainer.innerHTML;
        setTimeout(() => {

            document.getElementById(snackBarId).classList.add("show");
        }, 300);
        this.snackBarIds.push(snackBarId);
        this.setHideTimer(snackBarId);
    }
}