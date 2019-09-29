class Roulette {
    constructor(map, wheel) {
        this._map = map;
        this._wheel = wheel;
        this._balance = BALANCE;
        this._bets = {};
        this._betsTotal = 0;
        this._payout = 0;
        this._result;
    }

    initialiseGame() {
        // draw the wheel
        this._renderWheel();

        // update game infos
        document.querySelector("#balance span").innerText = this._balance.formatCurrency();
        document.querySelector("#betTotal span").innerText = this._betsTotal.formatCurrency();
        document.querySelector("#payout span").innerText = this._payout.formatCurrency();

        // add listeners
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
        document.querySelector("#betTotal span").innerText = this._betsTotal.formatCurrency();
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

        this._result = "20"//this._map[randomNumber];

        // spin wheel
        setTimeout(this._onWheelSpinCompleted.bind(this, rotation), duration);
        this._wheel.animate(keyFrames, options);

        // update balance
        countUp (
            document.querySelector("#balance span"),
            this._balance,
            this._balance-this._betsTotal,
        500);
        this._balance -= this._betsTotal;

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
        let allBets = [...document.querySelectorAll(".bet")];
        let payout = 0;

        allBets.forEach(betEntry => {
            if (betEntry.innerText.length) {
                if (betEntry.parentElement.tagName.toLowerCase() === "td") {
                    let bet = parseFloat(betEntry.parentElement.innerText.split("+")[1]);

                        if (Boolean(bet)) {
                            let value = betEntry.parentElement.innerText.split("+")[0].trim();

                            if (value === this._result) {
                                if (this._isThreeConsecutives(betEntry.parentElement)) {
                                    payout += bet * 11;
                                } else if (this._isTwoConsecutives(betEntry.parentElement)) {
                                    payout += bet * 17;
                                } else {
                                    payout += bet * 35;
                                }
                            }
                        }
                }
                if (betEntry.parentElement.tagName.toLowerCase() === "th") {
                    let bet = parseFloat(betEntry.parentElement.innerText.split("+")[1]);

                    if (Boolean(bet)) {
                        let groupId = betEntry.parentElement.id;
                        let value = betEntry.parentElement.innerText.split("+")[0].trim();
                        let payX35 = ["0", "00"].includes(value);

                        if (payX35) {
                            if (value === this._result) {
                                payout += bet * 35;
                            }
                        } else {
                            let numbers = RANGE_GROUPS[groupId];

                            if (numbers.includes(parseInt(this._result))) {
                                payout += bet;
                            }
                        }
                    }
                }
            }
        });

        this._payout = payout;
        this._gameCompleteRequest();
    }

    _gameCompleteRequest() {
        if (this._payout) {
            document.querySelector("#payout span").innerText = this._payout.formatCurrency();
            countUp(
                document.querySelector("#balance span"),
                this._balance,
                this._balance+this._payout,
                5000
            );
            setTimeout(this._onGameCompleted.bind(this), 5000);
        }
    }

    _onGameCompleted() {
        let allBets = [...document.querySelectorAll(".bet")];

        // reset match values
        this._result = null;
        this._betsTotal = 0;
        this._balance += this._payout;
        this._payout = 0;

        // update UI
        document.querySelector("#payout span").innerText = this._payout.formatCurrency();

        // reset all bets
        allBets.forEach(betEntry => betEntry.innerText = "");

        // re-enable table to allow player to place bets
        document.querySelector("#carpet table").classList.add("active");
    }

    _betPlaceOnTarget(target) {
        return Boolean(target.querySelector(".bet").innerText.length);
    }

    _isThreeConsecutives(target) {
        let previousBet = this._betPlaceOnTarget(target.previousElementSibling);
        let targetBet = this._betPlaceOnTarget(target);
        let nextBet = this._betPlaceOnTarget(target.nextElementSibling);
        let afterNextBet = this._betPlaceOnTarget(target.nextElementSibling);

        return (previousBet && targetBet && nextBet) || (targetBet && nextBet && afterNextBet);
    }

    _isTwoConsecutives(target) {
        let previousBet = this._betPlaceOnTarget(target.previousElementSibling);
        let targetBet = this._betPlaceOnTarget(target);
        let nextBet = this._betPlaceOnTarget(target.nextElementSibling);

        return (previousBet && targetBet) || (targetBet && nextBet);
    }
}
