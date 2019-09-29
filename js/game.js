class Roulette {
    constructor(map, wheel) {
        this._map = map;
        this._wheel = wheel;
        this._balance = BALANCE;
        this._bets = {};
        this._betsTotal = 0;
    }

    initialiseGame() {
        this._renderWheel();
        this._updateGameInfos();

        document.addEventListener("click", this._dispatchEvent.bind(this));
        document.querySelector("#placeBetBtn").addEventListener("click", this._placeBet.bind(this));
    }

    _dispatchEvent(event) {
        if (event.target.classList.contains("chip")) {
            this._selectChip(event)
        }
        if (["td", "th"].indexOf(event.target.tagName.toLowerCase()) > -1) {
            if (event.target.parentElement.parentElement.parentElement.classList.contains("active")) {
                if (event.target.querySelector(".bet")) {
                    this._addBet(event);
                }
            }
        }
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

    _updateGameInfos(config) {
        config = config || {};

        let balance = config.balance || this._balance;
        let bet = config.bet || this._betsTotal;
        let payout = config.payout || 0;

        if (this._balance != balance) {
            this._balance = config.newBalance;
        }

        document.querySelector("#balance span").innerText = this._balance.formatCurrency();
        document.querySelector("#betTotal span").innerText = bet.formatCurrency();
        document.querySelector("#payout span").innerText = payout.formatCurrency();
    }

    _selectChip(event) {
        let chip = event.target;
        let allChips = [...document.getElementsByClassName("chip")];
        let table = document.querySelector("#carpet table");

        allChips.forEach(currentChip => currentChip.classList.remove("selected"));

        chip.classList.add("selected");

        if (!table.classList.contains("active")) {
            table.classList.add("active");
        }
    }

    _addBet(event) {
        let target = event.target;
        let chipSelected = document.querySelector(".chip.selected");
        let chipSelectedValue = parseFloat(chipSelected.getAttribute("value"));
        let betOnTarget = target.querySelector(".bet");
        let betOnTargetValue = betOnTarget.innerText;

        if (betOnTargetValue.length) {
            betOnTargetValue = parseFloat(betOnTarget.innerText.split("+")[1]);
        } else {
            betOnTargetValue = 0;
        }

        betOnTargetValue += chipSelectedValue;
        betOnTarget.innerText = `+${betOnTargetValue}`;

        this._betsTotal += betOnTargetValue;
        this._updateGameInfos();
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

        // spin wheel
        setTimeout(this._onWheelSpinCompleted.bind(this, rotation), duration);
        this._wheel.animate(keyFrames, options);

        // update balance
        this._balance -= this._betsTotal;
        this._updateGameInfos();

        // disable table to prevent additional bets to be placed
        document.querySelector("#carpet table").classList.remove("active");

        // DEBUGGING PURPOSES
        console.info(randomNumber);
        console.info(this._map[randomNumber]);
    }

    _onWheelSpinCompleted(rotation) {
        // update wheel position
        this._wheel.style.transform = `rotateZ(${rotation}deg)`;

        this._computeWin();
    }

    _computeWin() {
        // re-enable table to allow player to place bets
        document.querySelector("#carpet table").classList.add("active");
    }
}
