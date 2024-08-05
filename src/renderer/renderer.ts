import {MainApp} from "renderer/mainApp.js";

document.addEventListener("DOMContentLoaded", async function () {
    let mainApp:MainApp = new MainApp();
    await mainApp.start();
});