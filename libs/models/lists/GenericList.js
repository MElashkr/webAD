/**
 * definition of the class "GenericList",
 * used by ListContainer
 */
class GenericList extends AbstractList {

    /**
     * constructs the GenericList
     * @param viewContainer name of the html container to show the view
     * @param {function(boolean)} operatingFinishedCallback callback function fired after finishing an operation
     * @param {number} speed delay between operation steps - animation speed
     */
    constructor(viewContainer, operatingFinishedCallback, speed) {
        super();
        if (viewContainer instanceof GenericListView)
            this._view = viewContainer;
        else
            this._view = new GenericListView(viewContainer);
        this._operatingFinishedCallback = operatingFinishedCallback;
        this._operationFinished = false;
        this._elements = [];
        this._speed = speed;
        this._resultTextColor = "red";
        this._resultText = "";
        this._showResultText = false;
    }

    /**
     * inserts element at head of the list
     * @param {string} element to be inserted
     */
    add(element) {
        // to add time between insertions on adding multiple elements at once
        window.setTimeout(() => {
            this._resetColors();
            let temp = new GenericElement(element);
            temp.backGroundColor = 'green';
            this._elements.unshift(temp);
            this.logList();
            this.draw();
            this._operationFinished = true;
            this._operatingFinishedCallback(true);
        }, this._delayInMS());
    }

    /**
     * used by generateRandomLists
     * adds an elements without doing any other stuff
     * @param {string} element to be inserted
     */
    addInstant(element) {
        this._elements.unshift(new GenericElement(element));
    }

    /**
     * inserts element at specified position
     * @param {string} element to be inserted
     * @param {number} pos position to insert
     */
    addAtNthPosition(element, pos) {
        this._resetColors();
        let temp = new GenericElement(element);
        temp.backGroundColor = 'green';
        if (pos < 0)
            pos = 0;
        // splice takes care if pos is greater than _elements.length
        this._elements.splice(pos, 0, temp);
        this.logList();
        this.draw();
        this._operationFinished = true;
        this._operatingFinishedCallback(true);
    }

    /**
     * removes the first element of the list
     */
    removeFirstElement() {
        this._resetColors();
        let removed = false;
        if (this._elements.length > 0) {
            removed = true;
            this._elements.shift();
        }
        this.logList();
        this.draw();
        this._operationFinished = true;
        // new state is only required when an element was actually removed
        this._operatingFinishedCallback(removed);
    }

    /**
     * searches and removes a specific element
     * @param {string} element to be deleted
     */
    removeElement(element) {
        this._resetColors();
        let removed = false;
        for (let i = 0; i < this._elements.length; i++) {
            if (this._elements[i].value === element) {
                this._elements.splice(i, 1);
                removed = true;
                break;
            }
        }
        if (!removed) {
            this._resultText = "'" + element + "' not found";
            this._showResultText = true;
        }
        this.draw();
        this._showResultText = false;
        this._operationFinished = true;
        // new state is only required when an element was actually removed
        this._operatingFinishedCallback(removed);
    }

    /**
     * removes element at specified position
     * @param {number} pos position to be deleted
     */
    removeNthElement(pos) {
        this._resetColors();
        let removed = false;
        if (this._elements.length > 0 && pos >= 0 && pos < this._elements.length) {
            removed = true;
            this._elements.splice(pos, 1);
        } else {
            this._resultText = "pos '" + pos + "' out of range";
            this._showResultText = true;
        }
        this.logList();
        this.draw();
        this._showResultText = false;
        this._operationFinished = true;
        this._operatingFinishedCallback(removed);
    }

    /**
     * returns the first element of the list
     * @returns {GenericElement} first element of the list or null
     */
    firstElement() {
        this._resetColors();
        let result = null;
        if (this._elements.length > 0) {
            this._elements[0].backGroundColor = 'green';
            result = this._elements[0];
        }
        this.draw();
        this._operationFinished = true;
        this._operatingFinishedCallback(false);
        return result;
    }

    /**
     * returns the element located at specified position
     * @param {number} pos position
     * @returns {GenericElement} element at pos or null
     */
    accessNthElement(pos) {
        this._resetColors();
        let result = null;
        if (pos >= 0 && pos < this._elements.length) {
            this._elements[pos].backGroundColor = 'green';
            result = this._elements[pos];
        } else {
            this._resultText = "pos '" + pos + "' out of range";
            this._showResultText = true;
        }
        this.draw();
        this._showResultText = false;
        this._operationFinished = true;
        this._operatingFinishedCallback(false);
        return result;
    }

    /**
     * searches a specific element
     * @param {string} element to be searched
     * @return {number} position of the element or -1 if not found
     */
    searchElement(element) {
        this._resetColors();
        let result = -1;
        for (let i = 0; i < this._elements.length; i++) {
            if (this._elements[i].value === element) {
                this._elements[i].backGroundColor = 'green';
                result = i;
                break;
            }
        }
        if (result === -1) {
            this._resultText = "'" + element + "' not found";
            this._showResultText = true;
        }
        this.draw();
        this._showResultText = false;
        this._operationFinished = true;
        this._operatingFinishedCallback(false);
        return result;
    }

    /**
     * counts the existing elements
     * @return {number} of existing elements
     */
    countElements() {
        this._resetColors();
        this._resultTextColor = "green";
        this._resultText = "Length: " + this._elements.length;
        this._showResultText = true;
        this.draw();
        this._showResultText = false;
        this._resultTextColor = "red";
        this._operationFinished = true;
        this._operatingFinishedCallback(false);
        return this._elements.length;
    }

    /**
     * draws the view
     */
    draw() {
        this._view.draw(this);
    }

    /**
     * zooms in
     */
    zoomIn() {
        this._view.zoomIn();
    }

    /**
     * zooms out
     */
    zoomOut() {
        this._view.zoomOut();
    }

    /**
     * makes a copy of the list
     * only view and operation finished callback function
     * are references to the old ones
     * @return {GenericList}
     */
    copy() {
        let copy = new GenericList(this._view, this._operatingFinishedCallback, this._speed);
        for (let e of this._elements)
            copy.elements.push(e.copy());
        return copy;
    }

    /**
     * prints the list into the console
     */
    logList() {
        let output = "{";
        for (let e of this._elements) {
            output += "[" + e.value + "]";
        }
        output += "}";
        console.log(output);
    }

    /**
     * resets colors of all elements
     * @private
     */
    _resetColors() {
        for (let e of this._elements)
            e.resetColors();
    }

    /**
     * returns the delay between steps (in milliseconds) based on the current speed
     * @return {number} delayInMS
     * @private
     */
    _delayInMS() {
        let delay;
        switch (this._speed) {
            case 0: // when speed is 0 take the default speed of 1 second for automatic animation
                delay = 1000;
                break;
            case 1:
                delay = 5000;
                break;
            case 2:
                delay = 4000;
                break;
            case 3:
                delay = 3000;
                break;
            case 4:
                delay = 2000;
                break;
            case 5:
                delay = 1000;
                break;
            case 6:
                delay = 850;
                break;
            case 7:
                delay = 650;
                break;
            case 8:
                delay = 500;
                break;
            case 9:
                delay = 250;
                break;
            case 10:
                delay = 0;
                break;
            default:
                console.log("default delayMS should not happen!");
                delay = 1000;
                break;
        }
        return delay;
    }

    /**
     * Getter Method
     * @return {GenericListView}
     */
    get view() {
        return this._view;
    }

    /**
     * Getter Method
     * @return {GenericElement[]} array containing the elements
     */
    get elements() {
        return this._elements;
    }

    /**
     * Getter Method
     * @return {boolean} true -> an operation has finished, false otherwise
     */
    get operationFinished() {
        return this._operationFinished;
    }

    /**
     * Setter Method
     * @param {boolean} value
     */
    set operationFinished(value) {
        this._operationFinished = value;
    }

    /**
     * Getter Method
     * @return {number}
     */
    get speed() {
        return this._speed;
    }

    /**
     * Setter Method
     * @param {number} value Animation speed of the list. Limited to 0 to 10.
     */
    set speed(value) {
        if (value < 0)
            value = 0;
        else if (value > 10)
            value = 10;
        this._speed = value;
        console.log("Set speed to " + this._speed);
    }

    /**
     * Getter Method
     * @return {string}
     */
    get resultTextColor() {
        return this._resultTextColor;
    }

    /**
     * Getter Method
     * @return {string}
     */
    get resultText() {
        return this._resultText;
    }

    /**
     * Getter Method
     * @return {boolean}
     */
    get showResultText() {
        return this._showResultText;
    }
}

/**
 * elements to be stored in the GenericList
 */
class GenericElement {

    /**
     * constructs an element to be stored in the GenericList
     * @param {string} value to be stored
     * @constructor
     */
    constructor(value) {
        this._backGroundColor = 'transparent';
        this._fontColor = 'black';
        this._strokeColor = 'black';
        this._value = value;
    }

    /**
     * resets the colors of an element
     */
    resetColors() {
        this._backGroundColor = 'transparent';
        this._fontColor = 'black';
        this._strokeColor = 'black';
    }

    /**
     * makes a copy of the element
     * @return {GenericElement}
     */
    copy() {
        let copy = new GenericElement(this._value);
        copy.backGroundColor = this._backGroundColor;
        copy.fontColor = this._fontColor;
        copy.strokeColor = this._strokeColor;
        return copy;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get backGroundColor() {
        return this._backGroundColor;
    }

    set backGroundColor(value) {
        this._backGroundColor = value;
    }

    get fontColor() {
        return this._fontColor;
    }

    set fontColor(value) {
        this._fontColor = value;
    }

    get strokeColor() {
        return this._strokeColor;
    }

    set strokeColor(value) {
        this._strokeColor = value;
    }
}