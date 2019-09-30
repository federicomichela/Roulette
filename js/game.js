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

    /**
     * Draw the wheel, set the game infos and add listeners to click events
     */
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

    /**
     * If a chip or a bet on the carpet are selected,
     * trigger the appropriate callback
     *
     * @param {Object} event
     * @private
     */
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

    /**
     * Draw all the segments of the wheel
     * TODO: draw pointer at the top of the wheel
     *
     * @private
     */
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

    /**
     * Select a chip
     *
     * @param {Object} event
     * @private
     */
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

    /**
     * Update the bet total
     *
     * @param {Object} event
     * @private
     */
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

    /**
     * Start the wheel spin animation,
     * update the balance by deducting the placed bet and
     * disable the carpet to prevent player from submitting new bets once
     * wheel starts spinning.
     *
     * @private
     */
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

        this._result = this._map[randomNumber];

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
    }

    /**
     * Update the wheel position and calculate the win
     *
     * @param {Number} rotation
     * @private
     */
    _onWheelSpinCompleted(rotation) {
        // update wheel position
        this._wheel.style.transform = `rotateZ(${rotation}deg)`;

        this._computeWin();
    }


    /**
     * Calculate payout
     *
     * @private
     */
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
                            let bets = [];

                            switch (groupId) {
                                case "range0":
                                    bets = [...document.querySelectorAll(`#carpet table tr:nth-child(0) td .bet`)];
                                    break;
                                case "range1":
                                    bets = [...document.querySelectorAll(`#carpet table tr:nth-child(1) td .bet`)];
                                    break;
                                case "range2":
                                    bets = [...document.querySelectorAll(`#carpet table tr:nth-child(2) td .bet`)];
                                    break;
                                case "range3":
                                    bets = [...document.querySelectorAll("#carpet table td .bet")].slice(0, 12);
                                    break;
                                case "range4":
                                    bets = [...document.querySelectorAll("#carpet table td .bet")].slice(12, 24);
                                    break;
                                case "range5":
                                    bets = [...document.querySelectorAll("#carpet table td .bet")].slice(24, 36);
                                    break;
                                case "range6":
                                    bets = [...document.querySelectorAll("#carpet table td .bet")].slice(0, 18);
                                    break;
                                case "range7":
                                case "range9":
                                    bets = [...document.querySelectorAll("#carpet table td:nth-child(odd) .bet")];
                                    break;
                                case "range8":
                                case "range10":
                                    bets = [...document.querySelectorAll("#carpet table td:nth-child(even) .bet")];
                                    break;
                                case "range11":
                                    bets = [...document.querySelectorAll("#carpet table td .bet")].slice(18, 36);
                                    break;
                            }

                            payout += this._getBetsTotal(bets) * bet;
                        }
                    }
                }
            }
        });

        this._payout = payout;
        this._gameCompleteRequest();
    }

    /**
     * Update payout and balance
     *
     * @private
     */
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
        } else {
            this._onGameCompleted();
        }
    }

    /**
     * reset game infos, reset bets on carpet and re-activate the Carpet
     * to enable the player to place new bets
     *
     * @private
     */
    _onGameCompleted() {
        let allBets = [...document.querySelectorAll(".bet")];

        // reset match values
        this._result = null;
        this._betsTotal = 0;
        this._balance += this._payout;
        this._payout = 0;

        // update UI
        document.querySelector("#betTotal span").innerText = this._betsTotal.formatCurrency();
        document.querySelector("#payout span").innerText = this._payout.formatCurrency();

        // reset all bets
        allBets.forEach(betEntry => betEntry.innerText = "");

        // re-enable table to allow player to place bets
        document.querySelector("#carpet table").classList.add("active");
    }

    /**
     * Check whether or not a bet was placed on that target.
     *
     * @param {DOMElement} target
     * @private
     * @returns {Boolean}
     */
    _betPlacedOnTarget(target) {
        return Boolean(target.querySelector(".bet").innerText.length);
    }

    /**
     * Check whether or not a bet was placed on three consecutive numbers
     *
     * @param {DOMElement} target
     * @private
     * @returns {Boolean}
     */
    _isThreeConsecutives(target) {
        let previousBet = this._betPlacedOnTarget(target.previousElementSibling);
        let targetBet = this._betPlacedOnTarget(target);
        let nextBet = this._betPlacedOnTarget(target.nextElementSibling);
        let afterNextBet = this._betPlacedOnTarget(target.nextElementSibling.nextElementSibling);

        return (previousBet && targetBet && nextBet) || (targetBet && nextBet && afterNextBet);
    }

    /**
     * Check whether or not a bet was placed on two consecutive numbers
     *
     * @param {DOMElement} target
     * @private
     * @returns {Boolean}
     */
    _isTwoConsecutives(target) {
        let previousBet = this._betPlacedOnTarget(target.previousElementSibling);
        let targetBet = this._betPlacedOnTarget(target);
        let nextBet = this._betPlacedOnTarget(target.nextElementSibling);

        return (previousBet && targetBet) || (targetBet && nextBet);
    }

    /**
     * Returns the total payout for a specific set of bets
     *
     * @param {Array} bets
     * @private
     * @returns {Number}
     */
    _getBetsTotal(bets) {
        let total = 0;

        bets.forEach(bet => {
            let betValue = parseFloat(bet.innerText.split("+")[1]) || 0;
            total += betValue;
        });

        return total;
    }
}
