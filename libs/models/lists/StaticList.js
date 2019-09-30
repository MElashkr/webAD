/**
 * definition of the class "StaticList",
 * used by ListContainer
 */
class StaticList extends AbstractList {

    /**
     * constructs the StaticList
     * @param viewContainer name of the html container to show the view
     * @param {function} operatingFinishedCallback callback function fired after finishing an operation
     * @param {number} speed delay between operation steps - animation speed
     * @param {number} size max number of elements the list can gather
     */
    constructor(viewContainer, operatingFinishedCallback, speed, size) {
        super();
        if (viewContainer instanceof StaticListView)
            this._view = viewContainer;
        else
            this._view = new StaticListView(viewContainer);
        this._operatingFinishedCallback = operatingFinishedCallback;
        this._operationFinished = false;
        this._elements = [];
        this._length = 0;
        // if size is falsy (0, null, undefined, false,..) -> take 16
        this.maxLength = size || 16;
        this._elements.length = this._maxLength;
        this._currentOperation = null;
        this._intervalId = 0;
        this._speed = speed;
        this._resultTextColor = "green";
        this._resultText = "";
        this._showResultText = false;
        this._operationCode = [];
        this._showOperationCode = false;
    }

    /**
     * runs the current operation
     * @private
     */
    _runOperation() {
        // don't start automatically when speed is set to 0, instead make just one step
        if (this._speed === 0)
            this.step();
        else if (this._currentOperation !== null && this._intervalId === 0) {
            this._intervalId = window.setInterval(this._currentOperation, this._delayInMS());
        }
    }

    /**
     * resumes the current operation
     */
    resumeOperation() {
        if (this._currentOperation !== null && this._intervalId === 0)
            this._intervalId = window.setInterval(this._currentOperation, this._delayInMS());
    }

    /**
     * pauses the current operation
     */
    pauseOperation() {
        window.clearInterval(this._intervalId);
        this._intervalId = 0;
    }

    /**
     * Has to be invoked inside of _currentOperation() when finishing the operation
     * and <b>before</b> the callback function gets invoked!
     * @private
     */
    _stopOperation() {
        this.pauseOperation();
        this._currentOperation = null;
    }

    /**
     * performs one single step of the current operation
     */
    step() {
        if (this._currentOperation !== null)
            this._currentOperation();
    }

    /**
     * inserts element at head of the list
     * @param {string} element to be inserted
     */
    add(element) {
        this._resetColors();
        let temp = new StaticElement(element);
        temp.backGroundColor = 'green';

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            if (this._length < this._maxLength) {
                this._elements[this._length++] = temp;
            } else {
                this._resultTextColor = "red";
                this._resultText = "List already full!";
                this._showResultText = true;
            }
            this.logList();
            this.draw();
            this._showResultText = false;
            this._operationFinished = true;
            this._operatingFinishedCallback();
        } else {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("void List::Add(ItemType a) {"),
                new CodeLine("  if (p < " + this._maxLength + ") {"),
                new CodeLine("      list[p] = a;"),
                new CodeLine("      p++;"),
                new CodeLine("  }"),
                new CodeLine("  else cout << \"Error-add\\n\""),
                new CodeLine("}")
            );
            let codeLine = 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._length < this._maxLength)
                            codeLine = 2;
                        else codeLine = 5;
                        break;
                    case 2:
                        this._elements[this._length++] = temp;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 3;
                        break;
                    case 3:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 6;
                        break;
                    case 5:
                        this._resultTextColor = "red";
                        this._resultText = "List already full!";
                        this._showResultText = true;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 6;
                        break;
                    case 6:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._showResultText = false;
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                        break;
                }
            };
            this._runOperation();
        }
    }

    /**
     * used by generateRandomLists
     * adds an elements without doing any other stuff
     * @param {string} element to be inserted
     */
    addInstant(element) {
        this._elements[this._length++] = new StaticElement(element);
    }

    /**
     * inserts element at specified position
     * @param {string} element to be inserted
     * @param {number} pos position to insert
     */
    addAtNthPosition(element, pos) {
        this._resetColors();
        this.draw();
        let temp = new StaticElement(element);
        temp.backGroundColor = 'green';

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            if (this._length < this._maxLength) {
                // check pos
                if (pos > this._length)
                    pos = this._length;
                else if (pos < 0)
                    pos = 0;

                // length has to be incremented here to show the list correctly
                let i = this._length++;

                this._currentOperation = () => {
                    if (i > this._length - 1 - pos) {
                        this._elements[i] = this._elements[i - 1];
                        this._elements[i].backGroundColor = 'orange';
                        this.logList();
                        this.draw();
                        this._elements[i].backGroundColor = 'transparent';
                        i--;
                    } else {
                        this._elements[i] = temp;
                        this.logList();
                        this.draw();
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                    }
                };
                this._runOperation();
            } else { // do nothing
                this._resultTextColor = "red";
                this._resultText = "List already full!";
                this._showResultText = true;
                this.logList();
                this.draw();
                this._showResultText = false;
                this._operationFinished = true;
                this._operatingFinishedCallback();
            }
        } else {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("void List::AddElement(ItemType a, int pos) {"),
                new CodeLine("  if (p < " + this._maxLength + ") {"),
                new CodeLine("      if (pos > p)"),
                new CodeLine("          pos = p;"),
                new CodeLine("      else if (pos < 0)"),
                new CodeLine("          pos = 0;"),
                new CodeLine("      int i = p++;"),
                new CodeLine("      for (; i > p - 1 - pos; i--)"),
                new CodeLine("          list[i] = list[i - 1];"),
                new CodeLine("      list[i] = a;"),
                new CodeLine("  } else cout << \"List already full!\\n\""),
                new CodeLine("}")
            );
            let codeLine = 1;
            let i;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._length < this._maxLength)
                            codeLine = 2;
                        else codeLine = 10;
                        break;
                    case 2:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (pos > this._length)
                            codeLine = 3;
                        else codeLine = 4;
                        break;
                    case 3:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        pos = this._length;
                        codeLine = 4;
                        break;
                    case 4:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (pos < 0)
                            codeLine = 5;
                        else codeLine = 6;
                        break;
                    case 5:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        pos = 0;
                        codeLine = 6;
                        break;
                    case 6:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        i = this._length++;
                        codeLine = 7;
                        break;
                    case 7:
                        if (i > this._length - 1 - pos) {
                            this._operationCode[7].highlighted = true;
                            this._operationCode[8].highlighted = true;
                            this._elements[i] = this._elements[i - 1];
                            this._elements[i].backGroundColor = 'orange';
                            this.draw();
                            this._elements[i].backGroundColor = 'transparent';
                            this._operationCode[7].highlighted = false;
                            this._operationCode[8].highlighted = false;
                            i--;
                        } else {
                            this._operationCode[9].highlighted = true;
                            this._elements[i] = temp;
                            this.draw();
                            this._operationCode[9].highlighted = false;
                            codeLine = 11;
                        }
                        break;
                    case 10:
                        this._resultTextColor = "red";
                        this._resultText = "List already full!";
                        this._showResultText = true;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 11;
                        break;
                    case 11:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._showResultText = false;
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                        break;
                }
            };
            this._runOperation();
        }
    }

    /**
     * removes the first element of the list
     */
    removeFirstElement() {
        this._resetColors();

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            if (this._length > 0)
                this._length--;
            else {
                this._resultTextColor = "red";
                this._resultText = "List empty!";
                this._showResultText = true;
            }
            this.logList();
            this.draw();
            this._showResultText = false;
            this._operationFinished = true;
            this._operatingFinishedCallback();
        } else {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("void List::RemoveFirst() {"),
                new CodeLine("  if (p > 0)"),
                new CodeLine("      p--;"),
                new CodeLine("  else cout << \"Error-remove\\n\""),
                new CodeLine("}")
            );
            let codeLine = 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._length > 0)
                            codeLine = 2;
                        else codeLine = 3;
                        break;
                    case 2:
                        this._length--;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 4;
                        break;
                    case 3:
                        this._resultTextColor = "red";
                        this._resultText = "List empty!";
                        this._showResultText = true;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 4;
                        break;
                    case 4:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._showResultText = false;
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                        break;
                }
            };
            this._runOperation();
        }
    }

    /**
     * searches and removes a specific element
     * @param {string} element to be deleted
     */
    removeElement(element) {
        this._resetColors();
        this.draw();

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            let i = this._length - 1;
            let found = false;
            this._currentOperation = () => {
                if (!found) {
                    if (i >= 0) {
                        this._elements[i].backGroundColor = 'orange';
                        this.logList();
                        if (this._elements[i].value === element) {
                            found = true;
                            this._elements[i].backGroundColor = 'red';
                        }
                        this.draw();
                        this._elements[i].backGroundColor = 'transparent';
                        if (!found)
                            i--;
                    } else {
                        // not found
                        if (!found) {
                            this._resultTextColor = "red";
                            this._resultText = "'" + element + "' not found";
                            this._showResultText = true;
                        }
                        this.logList();
                        this.draw();
                        this._showResultText = false;
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                    }
                } else {
                    if (i < this._length - 1) {
                        this._elements[i + 1].backGroundColor = 'orange';
                        this._elements[i] = this._elements[i + 1];
                        this.logList();
                        this.draw();
                        this._elements[i + 1].backGroundColor = 'transparent';
                        i++;
                    } else {
                        this._length--;
                        this._resetColors();
                        this.logList();
                        this.draw();
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                    }
                }
            };
            this._runOperation();
        } else {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("void List::RemoveElement(ItemType a) {"),
                new CodeLine("  int i = p - 1;"),
                new CodeLine("  while (i >= 0 && list[i] != a) i--;"),
                new CodeLine("  if (i >= 0) {"),
                new CodeLine("      while (i < p - 1) {"),
                new CodeLine("          list[i] = list[i + 1];"),
                new CodeLine("          i++;"),
                new CodeLine("      }"),
                new CodeLine("      p--;"),
                new CodeLine("  } else cout << \"Element not found!\\n;\""),
                new CodeLine("}")
            );
            let codeLine = 1;
            let i = this._length - 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 2;
                        break;
                    case 2:
                        if (i >= 0) {
                            this._operationCode[2].highlighted = true;
                            this._elements[i].backGroundColor = 'orange';
                            if (this._elements[i].value === element) {
                                codeLine = 3;
                                this._elements[i].backGroundColor = 'red';
                            }
                            this.draw();
                            this._elements[i].backGroundColor = 'transparent';
                            this._operationCode[2].highlighted = false;
                            if (codeLine === 2) // not found yet
                                i--;
                        } else {
                            this._operationCode[2].highlighted = true;
                            this.draw();
                            this._operationCode[2].highlighted = false;
                            codeLine = 3;
                        }
                        break;
                    case 3:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (i >= 0)
                            codeLine = 4;
                        else
                            codeLine = 9;
                        break;
                    case 4:
                        this._operationCode[4].highlighted = true;
                        this._operationCode[5].highlighted = true;
                        this._operationCode[6].highlighted = true;
                        this._operationCode[7].highlighted = true;
                        if (i < this._length - 1) {
                            this._elements[i + 1].backGroundColor = 'orange';
                            this._elements[i] = this._elements[i + 1];
                            this.draw();
                            this._elements[i + 1].backGroundColor = 'transparent';
                            i++;
                        } else {
                            this._resetColors();
                            this.draw();
                            codeLine = 8;
                        }
                        this._operationCode[4].highlighted = false;
                        this._operationCode[5].highlighted = false;
                        this._operationCode[6].highlighted = false;
                        this._operationCode[7].highlighted = false;
                        break;
                    case 8:
                        this._length--;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 10;
                        break;
                    case 9:
                        this._resultTextColor = "red";
                        this._resultText = "'" + element + "' not found";
                        this._showResultText = true;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 10;
                        break;
                    case 10:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._showResultText = false;
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                        break;
                }
            };
            this._runOperation();
        }
    }

    /**
     * removes element at specified position
     * @param {number} pos position to be deleted
     */
    removeNthElement(pos) {
        this._resetColors();

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            if (this._length > 0 && pos >= 0 && pos < this._length) {
                let i = this._length - 1 - pos;
                this._elements[i].backGroundColor = 'red';
                this.draw();
                this._currentOperation = () => {
                    if (i < this._length - 1) {
                        this._elements[i + 1].backGroundColor = 'orange';
                        this._elements[i] = this._elements[i + 1];
                        this.logList();
                        this.draw();
                        this._elements[i + 1].backGroundColor = 'transparent';
                        i++;
                    } else {
                        this._length--;
                        this._resetColors();
                        this.logList();
                        this.draw();
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                    }
                };
                this._runOperation();
            } else { // nothing to do
                this._resultTextColor = "red";
                this._resultText = "pos '" + pos + "' out of range";
                this._showResultText = true;
                this.logList();
                this.draw();
                this._showResultText = false;
                this._operationFinished = true;
                this._operatingFinishedCallback();
            }
        } else {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("void List::RemoveNthElement(int pos) {"),
                new CodeLine("  if (p > 0 && pos >= 0 && pos < p) {"),
                new CodeLine("      for (int i = p - 1 - pos; i < p - 1; i++)"),
                new CodeLine("          list[i] = list[i + 1];"),
                new CodeLine("      p--;"),
                new CodeLine("  }"),
                new CodeLine("}")
            );
            let codeLine = 1;
            let i = this._length - 1 - pos;
            if (this._length > 0 && pos >= 0 && pos < this._length) // to avoid undefined reference
                this._elements[i].backGroundColor = 'red';
            this.draw();
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._length > 0 && pos >= 0 && pos < this._length)
                            codeLine = 2;
                        else {
                            this._resultTextColor = "red";
                            this._resultText = "pos '" + pos + "' out of range";
                            this._showResultText = true;
                            codeLine = 6;
                        }
                        break;
                    case 2:
                        if (i < this._length - 1) {
                            this._operationCode[2].highlighted = true;
                            this._operationCode[3].highlighted = true;
                            this._elements[i + 1].backGroundColor = 'orange';
                            this._elements[i] = this._elements[i + 1];
                            this.draw();
                            this._elements[i + 1].backGroundColor = 'transparent';
                            this._operationCode[2].highlighted = false;
                            this._operationCode[3].highlighted = false;
                            i++;
                        } else {
                            this._operationCode[4].highlighted = true;
                            this._length--;
                            this._resetColors();
                            this.draw();
                            this._operationCode[4].highlighted = false;
                            codeLine = 6;
                        }
                        break;
                    case 6:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._showResultText = false;
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                        break;
                }
            };
            this._runOperation();
        }
    }

    /**
     * returns the first element of the list
     */
    firstElement() {
        this._resetColors();

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            if (this._length > 0) {
                this._elements[this._length - 1].backGroundColor = 'green';
            } else {
                this._resultTextColor = "red";
                this._resultText = "List empty!";
                this._showResultText = true;
            }
            this.draw();
            this._showResultText = false;
            this._operationFinished = true;
            this._operatingFinishedCallback();
        } else {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("ItemType List::FirstElement() {"),
                new CodeLine("  if (p > 0)"),
                new CodeLine("      return list[p - 1];"),
                new CodeLine("  else cout << \"Error-first\\n\""),
                new CodeLine("}")
            );
            let codeLine = 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._length > 0)
                            codeLine = 2;
                        else codeLine = 3;
                        break;
                    case 2:
                        this._operationCode[codeLine].highlighted = true;
                        this._elements[this._length - 1].backGroundColor = 'green';
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 4;
                        break;
                    case 3:
                        this._resultTextColor = "red";
                        this._resultText = "List empty!";
                        this._showResultText = true;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 4;
                        break;
                    case 4:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._showResultText = false;
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                        break;
                }
            };
            this._runOperation();
        }
    }

    /**
     * returns the element located at specified position
     * @param {number} pos position
     */
    accessNthElement(pos) {
        this._resetColors();

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            if (pos >= 0 && pos < this._length) {
                this._elements[this._length - 1 - pos].backGroundColor = 'green';
            } else {
                this._resultTextColor = "red";
                this._resultText = "pos '" + pos + "' out of range";
                this._showResultText = true;
            }
            this.draw();
            this._showResultText = false;
            this._operationFinished = true;
            this._operatingFinishedCallback();
        } else {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("ItemType List::AccessElement(int pos) {"),
                new CodeLine("  if (pos >= 0 && pos < p)"),
                new CodeLine("      return list[p - 1 - pos];"),
                new CodeLine("  else cout << \"Error-accessElement\\n\";"),
                new CodeLine("}")
            );
            let codeLine = 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (pos >= 0 && pos < this._length)
                            codeLine = 2;
                        else
                            codeLine = 3;
                        break;
                    case 2:
                        this._operationCode[codeLine].highlighted = true;
                        this._elements[this._length - 1 - pos].backGroundColor = 'green';
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 4;
                        break;
                    case 3:
                        this._operationCode[codeLine].highlighted = true;
                        this._resultTextColor = "red";
                        this._resultText = "pos '" + pos + "' out of range";
                        this._showResultText = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 4;
                        break;
                    case 4:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._showResultText = false;
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                        break;
                }
            };
            this._runOperation();
        }
    }

    /**
     * searches a specific element
     * @param {string} element to be searched
     */
    searchElement(element) {
        this._resetColors();
        let i = 0;

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            let found = false;
            this._currentOperation = () => {
                if (i < this._length && !found) {
                    this._elements[i].backGroundColor = 'orange';
                    this.logList();
                    this.draw();
                    this._elements[i].backGroundColor = 'transparent';
                    if (this._elements[i].value === element) {
                        found = true;
                        this._elements[i].backGroundColor = 'green';
                    } else
                        i++;
                } else {
                    // not found at all, or element found
                    if (!found) {
                        this._resultTextColor = "red";
                        this._resultText = "'" + element + "' not found";
                        this._showResultText = true;
                    }
                    this.logList();
                    this.draw();
                    this._showResultText = false;
                    this._stopOperation();
                    this._operationFinished = true;
                    this._operatingFinishedCallback();
                }
            };
            this._runOperation();
        } else {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("int List::Member(ItemType a) {"),
                new CodeLine("  int i = 0;"),
                new CodeLine("  while (i < p && list[i] != a) i++;"),
                new CodeLine("  if (i < p)"),
                new CodeLine("      return 1;"),
                new CodeLine("  return 0;"),
                new CodeLine("}")
            );
            let codeLine = 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 2;
                        break;
                    case 2:
                        if (i < this._length) {
                            this._operationCode[codeLine].highlighted = true;
                            this._elements[i].backGroundColor = 'orange';
                            this.draw();
                            this._elements[i].backGroundColor = 'transparent';
                            this._operationCode[codeLine].highlighted = false;
                            if (this._elements[i].value === element)
                                codeLine = 3;
                            else
                                i++;
                        } else {
                            this._operationCode[codeLine].highlighted = true;
                            this.draw();
                            this._operationCode[codeLine].highlighted = false;
                            codeLine = 3;
                        }
                        break;
                    case 3:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (i < this._length) {
                            codeLine = 4;
                            this._elements[i].backGroundColor = 'green';
                        } else
                            codeLine = 5;
                        break;
                    case 4:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 6;
                        break;
                    case 5:
                        this._operationCode[codeLine].highlighted = true;
                        this._resultTextColor = "red";
                        this._resultText = "'" + element + "' not found";
                        this._showResultText = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 6;
                        break;
                    case 6:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._showResultText = false;
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                        break;
                }
            };
            this._runOperation();
        }
    }

    /**
     * counts the existing elements
     * @return {number} of existing elements
     */
    countElements() {
        this._resetColors();
        this._resultTextColor = "green";
        this._resultText = "actLength: " + this._length;
        this._showResultText = true;

        if (this._showOperationCode) {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("int List::Length() {"),
                new CodeLine("  return p;"),
                new CodeLine("}")
            );
            this._operationCode[1].highlighted = true;
        }

        this.draw();
        this._showResultText = false;
        this._operationFinished = true;
        this._operatingFinishedCallback();
        return this._length;
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
     * @return {StaticList}
     */
    copy() {
        let copy = new StaticList(this._view, this._operatingFinishedCallback, this._speed, this._maxLength);
        for (let i = 0; i < this._length; i++)
            copy.elements[i] = this._elements[i].copy();
        copy.length = this._length;
        return copy;
    }

    /**
     * prints the list into the console
     */
    logList() {
        let output = "{";
        for (let i = 0; i < this._length; i++) {
            output += "[" + this._elements[i].value + "]";
        }
        output += "}";
        console.log(output);
    }

    /**
     * resets colors of all elements
     * @private
     */
    _resetColors() {
        for (let i = 0; i < this._length; i++)
            this._elements[i].resetColors();
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
     * @return {StaticListView}
     */
    get view() {
        return this._view;
    }

    /**
     * Getter Method
     * @return {StaticElement[]} array containing the elements
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

        // if there is an operation currently running
        // pause and resume it to apply the changed speed
        if (this._intervalId !== 0) {
            this.pauseOperation();
            this._runOperation();
        }
    }

    /**
     * Getter Method
     * @return {number}
     */
    get maxLength() {
        return this._maxLength;
    }

    /**
     * Setter Method
     * @param {number} value
     */
    set maxLength(value) {
        if (value < 0)
            value = 0;
        else if (value > 20)
            value = 20;
        this._maxLength = value;
        if (this._maxLength < this._length)
            this._length = this._maxLength;
    }

    /**
     * Getter Method
     * @return {number}
     */
    get length() {
        return this._length;
    }

    /**
     * Setter Method
     * @param {number} value
     */
    set length(value) {
        this._length = value;
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

    /**
     * Getter Method
     * @return {Array}
     */
    get operationCode() {
        return this._operationCode;
    }

    /**
     * Getter Method
     * @return {boolean}
     */
    get showOperationCode() {
        return this._showOperationCode;
    }

    /**
     * Setter Method
     * @param value
     */
    set showOperationCode(value) {
        this._showOperationCode = value;
    }
}

/**
 * elements to be stored in the StaticList
 */
class StaticElement {

    /**
     * constructs an element to be stored in the StaticList
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
     * @return {StaticElement}
     */
    copy() {
        let copy = new StaticElement(this._value);
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