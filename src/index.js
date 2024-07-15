import marsLandingController from "./controllers/marsLanding";
import myFavsController from "./controllers/myFavs";

// Goal: Set up routes, activate specific functions when routes are triggered
const routes = {
    "/marsLanding": marsLandingController,
    "/myFavs": myFavsController
};

function setRoute() {
    const currentRoute = window
        .location
        .hash
        .split("#")[1];

    for (let route in routes) {
        if (currentRoute === route) {
            return routes[route]();
        }
    }

    window.location.href = "#/marsLanding";
}

// Trigger the function on page load
document.addEventListener("DOMContentLoaded", setRoute);
// Trigger the function when the hash changes
window.addEventListener("hashchange", setRoute);