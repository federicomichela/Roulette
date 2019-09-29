var roulette;

/**
 * Launch roulette game
 */
function initialiseGame() {
    let map = generateWheelMap();
    let wheelContainer = document.querySelector(".wheel");

    roulette = new Roulette(map, wheelContainer);
    roulette.initialiseGame();
}

document.addEventListener('DOMContentLoaded', (event) => {
    initialiseGame();
});
