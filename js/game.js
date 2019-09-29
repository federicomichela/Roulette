class Roulette {
    constructor(map, wheel) {
        this._map = map;
        this._wheel = wheel;
    }

    initialiseGame() {
        this._renderWheel();

        document.querySelector("#placeBetBtn").addEventListener("click", this._placeBet.bind(this));
    }

    _renderWheel() {
        for (let i=0; i < SEGMENTS_NUM; i++) {
            let segment = document.createElement("div");
            let number = document.createElement("span");
            let size = i * (360/(SEGMENTS_NUM));

            segment.classList.add("segment");
            segment.style.webkitTransform = `rotateZ(${size}deg)`;
            segment.style.transform = `rotateZ(${size}deg)`;

            number.classList.add("number");
            number.textContent = this._map[i];

            segment.appendChild(number);
            this._wheel.appendChild(segment);
        }
    }

    _placeBet() {
        // start wheel spin
        let randomNumber = getRandomInt(0, this._map.length);
        let duration = getRandomInt(1000, 3000);
        let segmentDeg = 360 / this._map.length;
        let rotation = 360 + (Math.floor(duration/1000) * 360) - (randomNumber * segmentDeg);
        let currentRotation = getCurrentRotation(this._wheel);
        let keyFrames = [
            { transform: `rotateZ(${currentRotation}deg)` },
            { transform: `rotateZ(${rotation}deg)` }
        ];
        let options = {
            duration: duration
        };

        setTimeout(this._updatePosition.bind(this, rotation), duration);
        this._wheel.animate(keyFrames, options);

        console.info(randomNumber);
        console.info(this._map[randomNumber]);
    }

    _updatePosition(rotation) {
        this._wheel.style.transform = `rotateZ(${rotation}deg)`;
    }
}
