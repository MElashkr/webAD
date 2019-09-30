/**
 * used by LinearList-page
 * holds the different list types
 * implements tape recorder functionality
 */
class ListContainer {
    // MS Edge messes up when defining class variables here
    // despite that is the correct way according to mozilla developer page
    /*_genericList;
    _dynamicList;
    _staticList;
    _stateId;
    _maxStateId;
    _dbGeneric;
    _dbDynamic;
    _dbStatic;
    _operating;*/

    /**
     * constructs the ListContainer
     * @param {string} genericListViewContainer name of the html container to show the view
     * @param {string} dynamicListViewContainer name of the html container to show the view
     * @param {string} staticListViewContainer name of the html container to show the view
     * @param {number} speed delay between operation steps - animation speed
     * @param {function} operatingFinishedCallback callback function fired after finishing an operation
     * @param {function(boolean)} operatingChangedCallback callback function fired after operating state changed
     */
    constructor(genericListViewContainer, dynamicListViewContainer, staticListViewContainer,
                speed, operatingFinishedCallback, operatingChangedCallback) {
        let listFinishedCallback = (newStateRequired) => {
            this._listFinished(newStateRequired);
        };
        this._genericList = new GenericList(genericListViewContainer, listFinishedCallback, speed);
        this._dynamicList = new DynamicList(dynamicListViewContainer, listFinishedCallback, speed);
        this._staticList = new StaticList(staticListViewContainer, listFinishedCallback, speed, 16);
        this._stateId = -1;
        this._maxStateId = -1;
        this._dbGeneric = [];
        this._dbDynamic = [];
        this._dbStatic = [];
        this._operating = false;
        this._operatingFinishedCallback = operatingFinishedCallback;
        this._operatingChangedCallback = operatingChangedCallback;
        this._newStateRequired = false;
        this._makeNewState();
        this._genericList.draw();
        this._staticList.draw();
        this._dynamicList.draw();
    }

    /**
     * Fired when an operation finished
     * Checks if all lists have finished their operations =>
     * resets the operationFinished flags
     * sets operating state + fires makeNewState and operatingFinishedCallback
     * @param {boolean} newStateRequired only used by GenericList, Dynamic/Static let it undefined
     */
    _listFinished(newStateRequired) {
        // only GenericList decides whether a new state is required or not
        // StaticList and DynamicList don't set this parameter
        if (newStateRequired !== undefined)
            this._newStateRequired = newStateRequired;
        if (this._genericList.operationFinished && this._staticList.operationFinished && this._dynamicList.operationFinished) {
            this._genericList.operationFinished = false;
            this._dynamicList.operationFinished = false;
            this._staticList.operationFinished = false;
            if (this._newStateRequired)
                this._makeNewState();
            this.operating = false;
            this._operatingFinishedCallback();
        }
    }

    /**
     * generates empty lists
     */
    generateEmptyLists(staticListMaxLength) {
        let oldSpeedGeneric = this._genericList.speed;
        let oldSpeedStatic = this._staticList.speed;
        let oldSpeedDynamic = this._dynamicList.speed;
        let oldViewCont_gen = this._genericList.view;
        let oldViewCont_sta = this._staticList.view;
        let oldViewCont_dyn = this._dynamicList.view;
        let listFinishedCallback = (newStateRequired) => {
            this._listFinished(newStateRequired);
        };

        // create new empty lists
        this._genericList = new GenericList(oldViewCont_gen, listFinishedCallback, oldSpeedGeneric);
        this._staticList = new StaticList(oldViewCont_sta, listFinishedCallback, oldSpeedStatic, staticListMaxLength);
        this._dynamicList = new DynamicList(oldViewCont_dyn, listFinishedCallback, oldSpeedDynamic);

        this._refreshCodeSampleStates();

        // make a new state
        this._makeNewState();
        // redraw the lists
        this._genericList.draw();
        this._staticList.draw();
        this._dynamicList.draw();
    }

    /**
     * generates random lists
     */
    generateRandomLists() {
        let oldSpeedGeneric = this._genericList.speed;
        let oldSpeedStatic = this._staticList.speed;
        let oldSpeedDynamic = this._dynamicList.speed;
        let oldViewCont_gen = this._genericList.view;
        let oldViewCont_sta = this._staticList.view;
        let oldViewCont_dyn = this._dynamicList.view;
        let randSize = randomIntMaxExcluded(1, 10);
        let randMaxSize = randomIntMaxIncluded(randSize, 20);
        let listFinishedCallback = (newStateRequired) => {
            this._listFinished(newStateRequired);
        };

        // create new lists with zero delay between operations
        this._genericList = new GenericList(oldViewCont_gen, listFinishedCallback, oldSpeedGeneric);
        this._staticList = new StaticList(oldViewCont_sta, listFinishedCallback, oldSpeedStatic, randMaxSize);
        this._dynamicList = new DynamicList(oldViewCont_dyn, listFinishedCallback, oldSpeedDynamic);

        this._refreshCodeSampleStates();

        for (let i = 0; i < randSize; i++) {
            let randChar = randomCharacter();
            this._genericList.addInstant(randChar);
            this._staticList.addInstant(randChar);
            this._dynamicList.addInstant(randChar);
        }

        // make a new state
        this._makeNewState();
        // redraw the lists
        this._genericList.draw();
        this._staticList.draw();
        this._dynamicList.draw();
    }

    /**
     * pauses the currently running operations
     */
    pauseOperation() {
        if (this._operating) {
            if (!this._staticList.operationFinished)
                this._staticList.pauseOperation();
            if (!this._dynamicList.operationFinished)
                this._dynamicList.pauseOperation();
        }
    }

    /**
     * resumes the currently running operations
     */
    resumeOperation() {
        if (this._operating) {
            if (!this._staticList.operationFinished)
                this._staticList.resumeOperation();
            if (!this._dynamicList.operationFinished)
                this._dynamicList.resumeOperation();
        }
    }

    /**
     * performs a step of a running operation
     */
    stepOperation() {
        if (this._operating) {
            if (!this._staticList.operationFinished)
                this._staticList.step();
            if (!this._dynamicList.operationFinished)
                this._dynamicList.step();
        }
    }

    /**
     * adds an element to the different list types
     * @param {string} element to be added
     */
    add(element) {
        this.operating = true;
        this._genericList.add(element);
        this._staticList.add(element);
        this._dynamicList.add(element);
    }

    /**
     * adds a random element at random position to the different list types
     */
    addRandomElement() {
        this.addAtNthPosition(randomCharacter(), randomIntMaxIncluded(0, this._genericList.elements.length));
    }

    /**
     * adds an element at specified position to the different list types
     * @param {string} element
     * @param {number} pos
     */
    addAtNthPosition(element, pos) {
        this.operating = true;
        this._genericList.addAtNthPosition(element, pos);
        this._staticList.addAtNthPosition(element, pos);
        this._dynamicList.addAtNthPosition(element, pos);
    }

    /**
     * removes the first element of the different list types
     */
    removeFirstElement() {
        this.operating = true;
        this._genericList.removeFirstElement();
        this._staticList.removeFirstElement();
        this._dynamicList.removeFirstElement();
    }

    /**
     * removes a specific element in the different list types
     * @param {string} element to be removed
     */
    removeElement(element) {
        this.operating = true;
        this._genericList.removeElement(element);
        this._staticList.removeElement(element);
        this._dynamicList.removeElement(element);
    }

    /**
     *  removes a random existing element
     */
    removeRandomElement() {
        let randPos = randomIntMaxExcluded(0, this._genericList.elements.length);
        console.log("Remove random Element - pos: " + randPos);
        this.removeNthElement(randPos);
    }

    /**
     * removes element at specified position of the different list types
     * @param {number} pos position to be deleted
     */
    removeNthElement(pos) {
        this.operating = true;
        this._genericList.removeNthElement(pos);
        this._staticList.removeNthElement(pos);
        this._dynamicList.removeNthElement(pos);
    }

    /**
     * accesses the first elements of the different list types
     */
    firstElement() {
        this.operating = true;
        console.log('GenericList first element: ');
        console.log(this._genericList.firstElement());
        this._staticList.firstElement();
        this._dynamicList.firstElement();
    }

    /**
     * accesses the specified elements of the different list types
     */
    accessNthElement(pos) {
        this.operating = true;
        console.log('GenericList element at pos ' + pos + ':');
        console.log(this._genericList.accessNthElement(pos));
        this._staticList.accessNthElement(pos);
        this._dynamicList.accessNthElement(pos);
    }

    /**
     * performs a search for a specific element in the different list types
     * @param {string} element
     */
    searchElement(element) {
        this.operating = true;
        console.log('GenericList ' + element + ' found on pos: ' + this._genericList.searchElement(element));
        this._staticList.searchElement(element);
        this._dynamicList.searchElement(element);
    }

    /**
     * counts the existing elements in the different list types
     */
    countElements() {
        this.operating = true;
        console.log('GenericList count: ' + this._genericList.countElements());
        console.log('StaticList count: ' + this._staticList.countElements());
        this._dynamicList.countElements();
    }

    /**
     * tape recorder
     * go to first State
     * @param {number} speed
     * @param {boolean} genericListVisible visibility of the list
     * @param {boolean} staticListVisible visibility of the list
     * @param {boolean} dynamicListVisible visibility of the list
     */
    firstState(speed, genericListVisible, staticListVisible, dynamicListVisible) {
        this._stateId = 0;
        this._genericList = deepCopy(this._dbGeneric[this._stateId]);
        this._staticList = deepCopy(this._dbStatic[this._stateId]);
        this._dynamicList = deepCopy(this._dbDynamic[this._stateId]);

        this._refreshCodeSampleStates();

        // update speed values to match current settings of the page
        if (genericListVisible)
            this._genericList.speed = speed;
        else this._genericList.speed = 10;
        if (staticListVisible)
            this._staticList.speed = speed;
        else this._staticList.speed = 10;
        if (dynamicListVisible)
            this._dynamicList.speed = speed;
        else this._dynamicList.speed = 10;

        this._genericList.draw();
        this._staticList.draw();
        this._dynamicList.draw();
    }

    /**
     * tape recorder
     * go to previous State
     * @param {number} speed
     * @param {boolean} genericListVisible visibility of the list
     * @param {boolean} staticListVisible visibility of the list
     * @param {boolean} dynamicListVisible visibility of the list
     */
    previousState(speed, genericListVisible, staticListVisible, dynamicListVisible) {
        if (this._stateId > 0)
            this._stateId--;

        this._genericList = deepCopy(this._dbGeneric[this._stateId]);
        this._staticList = deepCopy(this._dbStatic[this._stateId]);
        this._dynamicList = deepCopy(this._dbDynamic[this._stateId]);

        this._refreshCodeSampleStates();

        // update speed values to match current settings of the page
        if (genericListVisible)
            this._genericList.speed = speed;
        else this._genericList.speed = 10;
        if (staticListVisible)
            this._staticList.speed = speed;
        else this._staticList.speed = 10;
        if (dynamicListVisible)
            this._dynamicList.speed = speed;
        else this._dynamicList.speed = 10;

        this._genericList.draw();
        this._staticList.draw();
        this._dynamicList.draw();
    }

    /**
     * tape recorder
     * go to next State
     * @param {number} speed
     * @param {boolean} genericListVisible visibility of the list
     * @param {boolean} staticListVisible visibility of the list
     * @param {boolean} dynamicListVisible visibility of the list
     */
    nextState(speed, genericListVisible, staticListVisible, dynamicListVisible) {
        if (this._stateId < this._maxStateId)
            this._stateId++;

        this._genericList = deepCopy(this._dbGeneric[this._stateId]);
        this._staticList = deepCopy(this._dbStatic[this._stateId]);
        this._dynamicList = deepCopy(this._dbDynamic[this._stateId]);

        this._refreshCodeSampleStates();

        // update speed values to match current settings of the page
        if (genericListVisible)
            this._genericList.speed = speed;
        else this._genericList.speed = 10;
        if (staticListVisible)
            this._staticList.speed = speed;
        else this._staticList.speed = 10;
        if (dynamicListVisible)
            this._dynamicList.speed = speed;
        else this._dynamicList.speed = 10;

        this._genericList.draw();
        this._staticList.draw();
        this._dynamicList.draw();
    }

    /**
     * tape recorder
     * go to last State
     * @param {number} speed
     * @param {boolean} genericListVisible visibility of the list
     * @param {boolean} staticListVisible visibility of the list
     * @param {boolean} dynamicListVisible visibility of the list
     */
    lastState(speed, genericListVisible, staticListVisible, dynamicListVisible) {
        this._stateId = this._maxStateId;

        this._genericList = deepCopy(this._dbGeneric[this._stateId]);
        this._staticList = deepCopy(this._dbStatic[this._stateId]);
        this._dynamicList = deepCopy(this._dbDynamic[this._stateId]);

        this._refreshCodeSampleStates();

        // update speed values to match current settings of the page
        if (genericListVisible)
            this._genericList.speed = speed;
        else this._genericList.speed = 10;
        if (staticListVisible)
            this._staticList.speed = speed;
        else this._staticList.speed = 10;
        if (dynamicListVisible)
            this._dynamicList.speed = speed;
        else this._dynamicList.speed = 10;

        this._genericList.draw();
        this._staticList.draw();
        this._dynamicList.draw();
    }

    /**
     * zooms in
     */
    zoomIn() {
        this._genericList.zoomIn();
        this._staticList.zoomIn();
        this._dynamicList.zoomIn();
    }

    /**
     * zooms out
     */
    zoomOut() {
        this._genericList.zoomOut();
        this._staticList.zoomOut();
        this._dynamicList.zoomOut();
    }

    /**
     * changes the animation speed of the <b>visible</b> lists
     * @param {number} speed
     * @param {boolean} genericListVisible visibility of the list
     * @param {boolean} staticListVisible visibility of the list
     * @param {boolean} dynamicListVisible visibility of the list
     */
    changeSpeed(speed, genericListVisible, staticListVisible, dynamicListVisible) {
        if (genericListVisible)
            this._genericList.speed = speed;
        if (staticListVisible)
            this._staticList.speed = speed;
        if (dynamicListVisible)
            this._dynamicList.speed = speed;
    }

    /**
     * Changes the maxLength of the StaticList
     * and invokes _makeNewState
     * @param {number} length
     */
    changeStaticListMaxLength(length) {
        this._staticList.maxLength = length;
        this._staticList.draw();
        this._makeNewState();
    }

    /**
     * makes deep copies of the current list objects
     * deletes superfluous states if needed
     * @private
     */
    _makeNewState() {
        /**
         * delete superfluous states
         * example: 5 states -> maxStateId = 4, stateId = 4
         * after going back 3 states -> stateId = 1
         * then a new state is required:
         * states [4],[3],[2] need to be deleted before making the new one
         */
        console.log("makeNewState()");
        if (this._stateId < this._maxStateId) {
            this._dbGeneric.splice(this._stateId + 1, this._maxStateId - this._stateId);
            this._dbStatic.splice(this._stateId + 1, this._maxStateId - this._stateId);
            this._dbDynamic.splice(this._stateId + 1, this._maxStateId - this._stateId);
        }
        this._dbGeneric.push(deepCopy(this._genericList));
        this._dbStatic.push(deepCopy(this._staticList));
        this._dbDynamic.push(deepCopy(this._dynamicList));
        this._stateId++;
        this._maxStateId = this._stateId;
        this._newStateRequired = false;
    }

    /**
     * Refreshes the code sample states
     * @private
     */
    _refreshCodeSampleStates() {
        this._staticList.showOperationCode = document.getElementById("checkboxStaticListCode").checked;
        this._dynamicList.showOperationCode = document.getElementById("checkboxDynamicListCode").checked;
    }

    /**
     * Getter Method
     * @return {GenericList} GenericList type
     */
    get genericList() {
        return this._genericList;
    }

    /**
     * Getter Method
     * @return {StaticList} StaticList type
     */
    get staticList() {
        return this._staticList;
    }

    /**
     * Getter Method
     * @return {DynamicList} DynamicList type
     */
    get dynamicList() {
        return this._dynamicList;
    }

    /**
     * Getter Method
     * @return {boolean} true when an operation is currently running, false otherwise
     */
    get operating() {
        return this._operating;
    }

    /**
     * Only for internal use!
     * Setter Method
     * Fires operatingChangedCallback
     * @param {boolean} value
     */
    set operating(value) {
        this._operating = value;
        this._operatingChangedCallback(value);
    }
}

/**
 * produces a pseudo-random integer value between min and max (max excluded)
 */
function randomIntMaxExcluded(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * produces a pseudo-random integer value between min and max (both included)
 */
function randomIntMaxIncluded(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * produces a pseudo-random character
 */
function randomCharacter() {
    let possibleChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!§$%&/()=?ß{}´`'-+,;.:_<>|^°*~#";
    return possibleChars.substr(Math.floor(Math.random() * possibleChars.length), 1);
}

/**
 * construct a copy of the source list
 * @param {AbstractList} source
 * @return {AbstractList} copy of source
 */
function deepCopy(source) {
    return source.copy()
}

/**
 * represents a line of code
 * which is eventually shown during an operation
 */
class CodeLine {

    /**
     * constructor
     * @param {string} code text which represents the line of code
     */
    constructor(code) {
        this._code = code;
        this._fontSize = 18;
        this._highlighted = false;
    }

    /**
     * Getter Method
     * @return {string}
     */
    get code() {
        return this._code;
    }

    /**
     * Getter Method
     * @return {number}
     */
    get fontSize() {
        return this._fontSize;
    }

    /**
     * Setter Method
     * @param {number} value
     */
    set fontSize(value) {
        this._fontSize = value;
    }

    /**
     * Getter Method
     * @return {boolean}
     */
    get highlighted() {
        return this._highlighted;
    }

    /**
     * Setter Method
     * @param {boolean} value
     */
    set highlighted(value) {
        this._highlighted = value;
    }
}