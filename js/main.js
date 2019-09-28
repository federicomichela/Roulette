function generateWheelMap() {
    let map = [];

    for (let i=0; i < SEGMENTS_NUM - 1; i++) {
        if (i === Math.floor(SEGMENTS_NUM/2)) {
            map.push("00");
        } else {
            map.push(i.toString());
        }
    }

    map.push((SEGMENTS_NUM - 1).toString());

    return map;
}

function renderWheel() {
    let wheel = document.querySelector(".wheel");
    let wheelMap = generateWheelMap();

    for (let i=0; i < SEGMENTS_NUM - 1; i++) {
        let segment = document.createElement("div");
        let number = document.createElement("span");
        let size = i * (360/(SEGMENTS_NUM-1));

        segment.classList.add("segment");
        segment.style.webkitTransform = `rotateZ(${size}deg)`;
        segment.style.transform = `rotateZ(${size}deg)`;

        number.classList.add("number");
        number.textContent = wheelMap[i];

        segment.appendChild(number);
        wheel.appendChild(segment);
    }
}

function initialiseGame() {
    renderWheel();
}

document.addEventListener('DOMContentLoaded', (event) => {
    initialiseGame();
});
