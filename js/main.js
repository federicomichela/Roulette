var roulette;

function generateWheelMap() {
    let map = [];

    for (let i=0; i < SEGMENTS_NUM - 1; i++) {
        map.push(i.toString());
    }

    map.splice([Math.floor(SEGMENTS_NUM/2)], 0, "00");

    return map;
}

function initialiseGame() {
    let map = generateWheelMap();
    let wheelContainer = document.querySelector(".wheel");

    roulette = new Roulette(map, wheelContainer);
    roulette.initialiseGame();
}

document.addEventListener('DOMContentLoaded', (event) => {
    initialiseGame();
});
