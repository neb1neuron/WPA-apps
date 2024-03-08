const open = document.querySelector(".open-par");
const close = document.querySelector(".close-par");
const display = document.querySelector(".display");
const del = document.querySelector(".delete");
const divide = document.querySelector(".divide");
const one = document.querySelector(".one");
const two = document.querySelector(".two");
const three = document.querySelector(".three");
const multiply = document.querySelector(".multiply");
const four = document.querySelector(".four");
const five = document.querySelector(".five");
const six = document.querySelector(".six");
const add = document.querySelector(".add");
const seven = document.querySelector(".seven");
const eight = document.querySelector(".eight");
const nine = document.querySelector(".nine");
const minus = document.querySelector(".minus");
const dot = document.querySelector(".dot");
const zero = document.querySelector(".zero");
const equalTo = document.querySelector(".equalTo");
//display.value tells the web browser to display whatever the value holds while the += means "append". i.e append what we click to our previous value.
open.addEventListener("click", function () {
    display.value += "(";
});
close.addEventListener("click", function () {
    display.value += ")";
});
one.addEventListener("click", function () {
    display.value += "1";
});
two.addEventListener("click", function () {
    display.value += "2";
});
three.addEventListener("click", function () {
    display.value += "3";
});

four.addEventListener("click", function () {
    display.value += "4";
});
five.addEventListener("click", function () {
    display.value += "5";
});
six.addEventListener("click", function () {
    display.value += "6";
});
seven.addEventListener("click", function () {
    display.value += "7";
});
eight.addEventListener("click", function () {
    display.value += "8";
});
nine.addEventListener("click", function () {
    display.value += "9";
});
zero.addEventListener("click", function () {
    display.value += "0";
});
dot.addEventListener("click", function () {
    display.value += ".";
});
del.addEventListener("click", function () {
    display.value = "";
});
equalTo.addEventListener("click", function () {
    //this means, try(run) this code for us, but if you catch(see) any error in the input, then display this error message "WRONG INPUT"
    try {
        display.value = eval(display.value);
    } catch (err) {
        display.value = "WRONG INPUT";
    }
});
add.addEventListener("click", function () {
    display.value += "+";
});
minus.addEventListener("click", function () {
    display.value += "-";
});
multiply.addEventListener("click", function () {
    display.value += "*";
});
divide.addEventListener("click", function () {
    display.value += "/";
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./sw.js")
            .then((reg) => console.log("service Worker: registered"))
            .catch((err) => console.log(`service worker; Error:${err}`));
    });
}