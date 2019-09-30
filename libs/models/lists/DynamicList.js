/**
 * definition of the class "DynamicList",
 * used by ListContainer
 */
class DynamicList extends AbstractList {

    /**
     * constructs the DynamicList
     * @param viewContainer name of the html container to show the view
     * @param {function} operatingFinishedCallback callback function fired after finishing an operation
     * @param {number} speed delay between operation steps - animation speed
     */
    constructor(viewContainer, operatingFinishedCallback, speed) {
        super();
        if (viewContainer instanceof DynamicListView)
            this._view = viewContainer;
        else
            this._view = new DynamicListView(viewContainer);
        this._operatingFinishedCallback = operatingFinishedCallback;
        this._operationFinished = false;
        this._head = null;
        this._help = null;
        this._help2 = null;
        this._helpElement = null;
        this._helpAddNthElement = null;
        this._helpAddNthElementAct = null;
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

        // Set operationCode
        this._operationCode.length = 0;
        this._operationCode.push(
            new CodeLine("void List::Add(ItemType a) {"),
            new CodeLine("  Element* help = new Element;"),
            new CodeLine("  help->value = a;"),
            new CodeLine("  help->next = head;"),
            new CodeLine("  head = help;"),
            new CodeLine("}")
        );
        let codeLine = 1;
        this._currentOperation = () => {
            switch (codeLine) {
                case 1:
                    this._operationCode[codeLine].highlighted = true;
                    this._helpElement = new DynamicElement("");
                    this._helpElement.backGroundColor = 'green';
                    this.draw();
                    this._operationCode[codeLine].highlighted = false;
                    codeLine = 2;
                    break;
                case 2:
                    this._operationCode[codeLine].highlighted = true;
                    this._helpElement.value = element;
                    this.draw();
                    this._operationCode[codeLine].highlighted = false;
                    codeLine = 3;
                    break;
                case 3:
                    this._operationCode[codeLine].highlighted = true;
                    this._helpElement.next = this._head;
                    this.draw();
                    this._operationCode[codeLine].highlighted = false;
                    codeLine = 4;
                    break;
                case 4:
                    this._operationCode[codeLine].highlighted = true;
                    this._head = this._helpElement;
                    this._help = this._helpElement;
                    this._helpElement = null;
                    this.draw();
                    this._operationCode[codeLine].highlighted = false;
                    codeLine = 5;
                    break;
                case 5:
                    this._operationCode[codeLine].highlighted = true;
                    this._help = null;
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

    /**
     * used by generateRandomLists
     * adds an elements without doing any other stuff
     * @param {string} element to be inserted
     */
    addInstant(element) {
        let help = new DynamicElement(element);
        help.next = this._head;
        this._head = help;
    }

    /**
     * inserts element at specified position
     * @param {string} element to be inserted
     * @param {number} pos position to insert
     */
    addAtNthPosition(element, pos) {
        this._resetColors();

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            let step = 'init';
            let subStep = 1;
            this._currentOperation = () => {
                switch (step) {
                    case 'init':
                        this._helpElement = new DynamicElement(element);
                        this._helpElement.backGroundColor = 'green';
                        if (this._head !== null)
                            this._head.backGroundColor = 'orange';
                        if (this._head === null || pos <= 0)
                            step = 'insertFront';
                        else
                            step = 'find';
                        this.draw();
                        break;
                    case 'insertFront':
                        switch (subStep) {
                            case 1:
                                if (this._head !== null)
                                    this._head.backGroundColor = 'transparent';
                                this._helpElement.next = this._head;
                                subStep = 2;
                                break;
                            case 2:
                                this._helpAddNthElement = this._helpElement;
                                this._helpElement = null;
                                this._head = this._helpAddNthElement;
                                subStep = 1;
                                step = 'end';
                                break;
                        }
                        this.draw();
                        break;
                    case 'find':
                        switch (subStep) {
                            case 1:
                                this._help = this._head;
                                subStep = 2;
                                break;
                            case 2:
                                this._head.backGroundColor = 'transparent';
                                if (this._help.next !== null)
                                    this._help.next.backGroundColor = 'orange';
                                if (this._help.next !== null && pos > 1)
                                    subStep = 3;
                                else {
                                    subStep = 1;
                                    step = 'insert';
                                    if (this._help.next !== null)
                                        this._help.next.backGroundColor = 'transparent';
                                    this._helpElement.next = this._help.next;
                                }
                                break;
                            case 3:
                                if (this._help.next !== null && pos > 1) {
                                    pos--;
                                    this._help = this._help.next;
                                    this._help.backGroundColor = 'transparent';
                                    if (this._help.next !== null)
                                        this._help.next.backGroundColor = 'orange';
                                } else {
                                    subStep = 1;
                                    step = 'insert';
                                    if (this._help.next !== null)
                                        this._help.next.backGroundColor = 'transparent';
                                    this._helpElement.next = this._help.next;
                                }
                                break;
                        }
                        this.draw();
                        break;
                    case 'insert':
                        this._helpAddNthElement = this._helpElement;
                        this._helpElement = null;
                        this._help.next = this._helpAddNthElement;
                        step = 'end';
                        this.draw();
                        break;
                    case 'end':
                        this._help = null;
                        this._helpAddNthElement = null;
                        this._helpElement = null;
                        this.draw();
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                        break;
                }
            };
            this._runOperation();
        } else {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("void List::AddElement(ItemType a, int pos) {"),
                new CodeLine("  Element* pred, * act;"),
                new CodeLine("  int actpos = 1;"),
                new CodeLine("  if (pos <= 0 || head == 0)"),
                new CodeLine("      Add(a);"),
                new CodeLine("  else {"),
                new CodeLine("      pred = head;"),
                new CodeLine("      act = head->next;"),
                new CodeLine("      while (act != 0 && actpos < pos) {"),
                new CodeLine("          pred = act;"),
                new CodeLine("          act = act->next;"),
                new CodeLine("          actpos++;"),
                new CodeLine("      }"),
                new CodeLine("      pred->next = new Element;"),
                new CodeLine("      pred->next->value = a;"),
                new CodeLine("      pred->next->next = act;"),
                new CodeLine("  }"),
                new CodeLine("}")
            );
            let codeLine = 1;
            let subStep = 1;
            let actPos = 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        actPos = 1;
                        this._operationCode[1].highlighted = true;
                        this._operationCode[2].highlighted = true;
                        this.draw();
                        this._operationCode[1].highlighted = false;
                        this._operationCode[2].highlighted = false;
                        codeLine = 3;
                        break;
                    case 3:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (pos <= 0 || this._head === null)
                            codeLine = 4;
                        else codeLine = 6;
                        break;
                    case 4:
                        switch (subStep) {
                            case 1:
                                this._helpElement = new DynamicElement(element);
                                this._helpElement.backGroundColor = 'green';
                                subStep = 2;
                                break;
                            case 2:
                                this._helpElement.next = this._head;
                                subStep = 3;
                                break;
                            case 3:
                                this._helpAddNthElement = this._helpElement;
                                this._helpElement = null;
                                this._head = this._helpAddNthElement;
                                subStep = 1;
                                codeLine = 17;
                                break;
                        }
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        break;
                    case 6:
                        this._help = this._head;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 7;
                        break;
                    case 7:
                        this._help2 = this._head.next;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 8;
                        break;
                    case 8:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._help2 !== null && actPos < pos)
                            codeLine = 9;
                        else
                            codeLine = 12;
                        break;
                    case 9:
                        this._help = this._help2;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 10;
                        break;
                    case 10:
                        this._help2 = this._help2.next;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 11;
                        break;
                    case 11:
                        this._operationCode[codeLine].highlighted = true;
                        actPos++;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 8;
                        break;
                    case 12:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 13;
                        break;
                    case 13:
                        this._help.next = new DynamicElement("");
                        this._help.backGroundColor = 'green';
                        this._helpAddNthElementAct = this._help2;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 14;
                        break;
                    case 14:
                        this._help.next.value = element;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 15;
                        break;
                    case 15:
                        this._help.next.next = this._help2;
                        this._helpAddNthElementAct = null;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 17;
                        break;
                    case 17:
                        this._operationCode[codeLine].highlighted = true;
                        this._helpElement = null;
                        this._helpAddNthElement = null;
                        this._help = null;
                        this._help2 = null;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
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
            if (this._head !== null)
                this._head = this._head.next;
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
                new CodeLine("  if (head != 0) {"),
                new CodeLine("      Element* help = head;"),
                new CodeLine("      head = head->next;"),
                new CodeLine("      delete help;"),
                new CodeLine("  } else cout << \"Error-remove\\n\";"),
                new CodeLine("}")
            );
            let codeLine = 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._head !== null)
                            codeLine = 2;
                        else
                            codeLine = 5;
                        break;
                    case 2:
                        this._operationCode[codeLine].highlighted = true;
                        this._help = this._head;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 3;
                        break;
                    case 3:
                        this._operationCode[codeLine].highlighted = true;
                        this._head = this._head.next;
                        this._helpElement = this._help;
                        this._help = null;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 4;
                        break;
                    case 4:
                        this._helpElement.backGroundColor = 'red';
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._helpElement = null;
                        codeLine = 6;
                        break;
                    case 5:
                        this._operationCode[codeLine].highlighted = true;
                        this._resultTextColor = "red";
                        this._resultText = "List empty!";
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
     * searches and removes a specific element
     * @param {string} element to be deleted
     */
    removeElement(element) {
        this._resetColors();

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            let step = 'init';
            let subStep = 1;
            this._currentOperation = () => {
                switch (step) {
                    case 'init':
                        if (this._head === null) {
                            this._resultText = "List empty!";
                            this._resultTextColor = "red";
                            this._showResultText = true;
                            step = 'end';
                        } else {
                            this._head.backGroundColor = 'orange';
                            this._help = this._head;
                            step = 'findInit';
                        }
                        this.draw();
                        break;
                    case 'findInit':
                        if (this._head.value === element) {
                            this._head.backGroundColor = '#ff601c';
                            step = 'delFirst';
                        } else {
                            this._head.backGroundColor = 'transparent';
                            this._help = this._head;
                            this._help2 = this._help.next;
                            this._help2.backGroundColor = 'orange';
                            step = 'find';
                        }
                        this.draw();
                        break;
                    case 'find':
                        if (this._help2 !== null && this._help2.value !== element) {
                            this._help2.backGroundColor = 'transparent';
                            this._help = this._help2;
                            this._help2 = this._help2.next;
                            if (this._help2 !== null)
                                this._help2.backGroundColor = 'orange';
                        } else {
                            if (this._help2 !== null) {
                                this._help2.backGroundColor = '#ff601c';
                                step = 'del';
                            } else {
                                this._resultText = "'" + element + "' not found";
                                this._resultTextColor = "red";
                                this._showResultText = true;
                                step = 'end';
                            }
                        }
                        this.draw();
                        break;
                    case 'del':
                        switch (subStep) {
                            case 1:
                                this._help.next = this._help2.next;
                                this._helpElement = this._help2;
                                this._help2 = null;
                                subStep = 2;
                                break;
                            case 2:
                                this._helpElement.backGroundColor = 'red';
                                subStep = 3;
                                break;
                            case 3:
                                this._helpElement = null;
                                this._help.backGroundColor = 'transparent';
                                subStep = 1;
                                step = 'end';
                                break;
                        }
                        this.draw();
                        break;
                    case 'delFirst':
                        switch (subStep) {
                            case 1:
                                this._help = null;
                                this._helpElement = this._head;
                                this._head = this._head.next;
                                subStep = 2;
                                this.draw();
                                break;
                            case 2:
                                this._helpElement.backGroundColor = 'red';
                                this.draw();
                                this._helpElement = null;
                                subStep = 1;
                                step = 'end';
                                break;
                        }
                        break;
                    case 'end':
                        this._help = null;
                        this._help2 = null;
                        this._helpElement = null;
                        this.draw();
                        this._showResultText = false;
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                        break;
                }
            };
            this._runOperation();
        } else {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("void List::RemoveElement(ItemType a) {"),
                new CodeLine("  if (head != 0) {"),
                new CodeLine("      Element* help = head;"),
                new CodeLine("      if (head->value != a) {"),
                new CodeLine("          Element* help2 = help->next;"),
                new CodeLine("          while (help2 != 0 && help2->value != a) {"),
                new CodeLine("              help = help2;"),
                new CodeLine("              help2 = help2->next;"),
                new CodeLine("          }"),
                new CodeLine("          if (help2 != 0) {"),
                new CodeLine("              help->next = help2->next;"),
                new CodeLine("              delete help2;"),
                new CodeLine("          } else cout << \"Error-ElementNotFound\\n\";"),
                new CodeLine("      } else {"),
                new CodeLine("          head = head->next;"),
                new CodeLine("          delete help;"),
                new CodeLine("      }"),
                new CodeLine("  } else cout << \"Error-ListEmpty\\n\";"),
                new CodeLine("}")
            );
            let codeLine = 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._head !== null)
                            codeLine = 2;
                        else codeLine = 17;
                        break;
                    case 2:
                        this._help = this._head;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 3;
                        break;
                    case 3:
                        this._head.backGroundColor = 'orange';
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._head.backGroundColor = 'transparent';
                        if (this._head.value !== element)
                            codeLine = 4;
                        else codeLine = 13;
                        break;
                    case 4:
                        this._help2 = this._help.next;
                        this._operationCode[codeLine].highlighted = true;
                        if (this._help2 !== null)
                            this._help2.backGroundColor = 'orange';
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 5;
                        break;
                    case 5:
                        if (this._help2 !== null)
                            this._help2.backGroundColor = 'orange';
                        this._help.backGroundColor = 'transparent';
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._help2 !== null && this._help2.value !== element)
                            codeLine = 6;
                        else
                            codeLine = 9;
                        break;
                    case 6:
                        this._help = this._help2;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 7;
                        break;
                    case 7:
                        this._help2 = this._help2.next;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 5;
                        break;
                    case 9:
                        if (this._help2 !== null) {
                            this._help2.backGroundColor = '#ff601c';
                            codeLine = 10;
                        } else codeLine = 12;
                        this._operationCode[9].highlighted = true;
                        this.draw();
                        this._operationCode[9].highlighted = false;
                        break;
                    case 10:
                        this._help.next = this._help2.next;
                        this._helpElement = this._help2;
                        this._help2 = null;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 11;
                        break;
                    case 11:
                        this._helpElement.backGroundColor = 'red';
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._helpElement = null;
                        this._help.backGroundColor = 'transparent';
                        codeLine = 18;
                        break;
                    case 12:
                        this._resultText = "'" + element + "' not found";
                        this._resultTextColor = "red";
                        this._showResultText = true;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 18;
                        break;
                    case 13:
                        this._help.backGroundColor = '#ff601c';
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 14;
                        break;
                    case 14:
                        this._head = this._head.next;
                        this._helpElement = this._help;
                        this._help = null;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 15;
                        break;
                    case 15:
                        this._helpElement.backGroundColor = 'red';
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._helpElement = null;
                        codeLine = 18;
                        break;
                    case 17:
                        this._resultText = "List empty!";
                        this._resultTextColor = "red";
                        this._showResultText = true;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 18;
                        break;
                    case 18:
                        this._operationCode[codeLine].highlighted = true;
                        this._help = null;
                        this._help2 = null;
                        this._helpElement = null;
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
        let posCopy = pos;

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            let step = 'init';
            let subStep = 1;
            this._help = this._head;
            this._currentOperation = () => {
                switch (step) {
                    case 'init':
                        if (this._head === null) {
                            this._resultText = "List empty!";
                            this._resultTextColor = "red";
                            this._showResultText = true;
                            step = 'end';
                        } else if (pos < 0) {
                            this._resultText = "pos '" + posCopy + "' out of range";
                            this._resultTextColor = "red";
                            this._showResultText = true;
                            step = 'end';
                        } else {
                            this._help = this._head;
                            if (pos > 0) {
                                this._head.backGroundColor = 'orange';
                                step = 'find';
                            } else {
                                this._head.backGroundColor = '#ff601c';
                                step = 'delFirst';
                            }
                        }
                        this.draw();
                        break;
                    case 'find':
                        if (this._help !== null && pos > 1) {
                            pos--;
                            this._help.backGroundColor = 'transparent';
                            this._help = this._help.next;
                            if (this._help !== null)
                                this._help.backGroundColor = 'orange';
                        } else if (this._help === null) {
                            this._resultText = "pos '" + posCopy + "' out of range";
                            this._resultTextColor = "red";
                            this._showResultText = true;
                            step = 'end';
                        } else {
                            this._help2 = this._help.next;
                            step = 'del';
                        }
                        this.draw();
                        break;
                    case 'del':
                        switch (subStep) {
                            case 1:
                                if (this._help2 !== null) {
                                    this._help2.backGroundColor = '#ff601c';
                                    subStep = 2;
                                } else { // help is already the last element
                                    this._help.backGroundColor = 'transparent';
                                    this._resultText = "pos '" + posCopy + "' out of range";
                                    this._resultTextColor = "red";
                                    this._showResultText = true;
                                    subStep = 1;
                                    step = 'end';
                                }
                                break;
                            case 2:
                                this._help.next = this._help2.next;
                                this._helpElement = this._help2;
                                this._help2 = null;
                                subStep = 3;
                                break;
                            case 3:
                                this._helpElement.backGroundColor = 'red';
                                subStep = 4;
                                break;
                            case 4:
                                this._helpElement = null;
                                this._help.backGroundColor = 'transparent';
                                subStep = 1;
                                step = 'end';
                                break;
                        }
                        this.draw();
                        break;
                    case 'delFirst':
                        switch (subStep) {
                            case 1:
                                this._head = this._head.next;
                                this._helpElement = this._help;
                                this._help = null;
                                subStep = 2;
                                this.draw();
                                break;
                            case 2:
                                this._helpElement.backGroundColor = 'red';
                                this.draw();
                                this._helpElement = null;
                                subStep = 1;
                                step = 'end';
                                break;
                        }
                        break;
                    case 'end':
                        this._help = null;
                        this._help2 = null;
                        this._helpElement = null;
                        this.draw();
                        this._showResultText = false;
                        this._stopOperation();
                        this._operationFinished = true;
                        this._operatingFinishedCallback();
                        break;
                }
            };
            this._runOperation();
        } else {
            // Set operationCode
            this._operationCode.length = 0;
            this._operationCode.push(
                new CodeLine("void List::RemoveElement(int pos) {"),
                new CodeLine("  Element* pred, * act;"),
                new CodeLine("  int actpos = 1;"),
                new CodeLine("  if (head == 0 || pos < 0) cout << \"Error-removeElement\\n\";"),
                new CodeLine("  else if (pos == 0)"),
                new CodeLine("      RemoveFirst();"),
                new CodeLine("  else {"),
                new CodeLine("      pred = head;"),
                new CodeLine("      act = head->next;"),
                new CodeLine("      while (act != 0 && actpos < pos) {"),
                new CodeLine("          pred = act;"),
                new CodeLine("          act = act->next;"),
                new CodeLine("          actpos++;"),
                new CodeLine("      }"),
                new CodeLine("      if (act != 0) {"),
                new CodeLine("        pred->next = act->next;"),
                new CodeLine("        delete act;"),
                new CodeLine("      }"),
                new CodeLine("  }"),
                new CodeLine("}")
            );
            let codeLine = 1;
            let subStep = 1;
            let actPos = 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        actPos = 1;
                        this._operationCode[1].highlighted = true;
                        this._operationCode[2].highlighted = true;
                        this.draw();
                        this._operationCode[1].highlighted = false;
                        this._operationCode[2].highlighted = false;
                        codeLine = 3;
                        break;
                    case 3:
                        if (pos < 0) {
                            this._resultText = "pos '" + posCopy + "' out of range";
                            this._resultTextColor = "red";
                            this._showResultText = true;
                            codeLine = 19;
                        } else if (this._head === null) {
                            this._resultText = "List empty!";
                            this._resultTextColor = "red";
                            this._showResultText = true;
                            codeLine = 19;
                        } else
                            codeLine = 4;
                        this._operationCode[3].highlighted = true;
                        this.draw();
                        this._operationCode[3].highlighted = false;
                        break;
                    case 4:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (pos <= 0)
                            codeLine = 5;
                        else
                            codeLine = 7;
                        break;
                    case 5:
                        switch (subStep) {
                            case 1:
                                this._help = this._head;
                                this._help.backGroundColor = '#ff601c';
                                subStep = 2;
                                break;
                            case 2:
                                this._head = this._head.next;
                                this._helpElement = this._help;
                                this._help = null;
                                subStep = 3;
                                break;
                            case 3:
                                this._helpElement.backGroundColor = 'red';
                                subStep = 4;
                                break;
                            case 4:
                                this._helpElement = null;
                                subStep = 1;
                                codeLine = 19;
                                break;
                        }
                        this._operationCode[5].highlighted = true;
                        this.draw();
                        this._operationCode[5].highlighted = false;
                        break;
                    case 7:
                        this._help = this._head;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 8;
                        break;
                    case 8:
                        this._help2 = this._head.next;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 9;
                        break;
                    case 9:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._help2 !== null && actPos < pos)
                            codeLine = 10;
                        else
                            codeLine = 13;
                        break;
                    case 10:
                        this._help = this._help2;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 11;
                        break;
                    case 11:
                        this._help2 = this._help2.next;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 12;
                        break;
                    case 12:
                        this._operationCode[codeLine].highlighted = true;
                        actPos++;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 9;
                        break;
                    case 13:
                        if (this._help2 !== null)
                            this._help2.backGroundColor = 'orange';
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 14;
                        break;
                    case 14:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._help2 !== null)
                            codeLine = 15;
                        else {
                            this._resultText = "pos '" + posCopy + "' out of range";
                            this._resultTextColor = "red";
                            this._showResultText = true;
                            codeLine = 19;
                        }
                        break;
                    case 15:
                        this._help.next = this._help2.next;
                        this._helpElement = this._help2;
                        this._help2 = null;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 16;
                        break;
                    case 16:
                        this._helpElement.backGroundColor = 'red';
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        this._helpElement = null;
                        codeLine = 19;
                        break;
                    case 19:
                        this._operationCode[codeLine].highlighted = true;
                        this._help = null;
                        this._help2 = null;
                        this._helpElement = null;
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
            if (this._head !== null) {
                this._head.backGroundColor = 'green';
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
                new CodeLine("  if (head != 0)"),
                new CodeLine("      return head->value;"),
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
                        if (this._head !== null)
                            codeLine = 2;
                        else codeLine = 3;
                        break;
                    case 2:
                        this._operationCode[codeLine].highlighted = true;
                        this._head.backGroundColor = 'green';
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
        let posCopy = pos;

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            let found = false;
            this._help = this._head;
            this._currentOperation = () => {
                if (posCopy < 0) { // negative pos not allowed
                    this._help = null;
                    this._resultTextColor = "red";
                    this._resultText = "pos '" + posCopy + "' out of range";
                    this._showResultText = true;
                    this.draw();
                    this._showResultText = false;
                    this._stopOperation();
                    this._operationFinished = true;
                    this._operatingFinishedCallback();
                } else if (this._help !== null && pos > 0) {
                    pos--;
                    this._help.backGroundColor = 'orange';
                    this.draw();
                    this._help.backGroundColor = 'transparent';
                    this._help = this._help.next;
                } else if (this._help !== null) {
                    this._help.backGroundColor = 'green';
                    this.draw();
                    this._help = null;
                    found = true;
                } else { // finished
                    if (!found) {
                        this._resultTextColor = "red";
                        this._resultText = "pos '" + posCopy + "' out of range";
                        this._showResultText = true;
                    }
                    this._help = null;
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
                new CodeLine("ItemType List::AccessElement(int pos) {"),
                new CodeLine("  if (pos >= 0) {"),
                new CodeLine("      Element* help = head;"),
                new CodeLine("      while (help != 0 && pos > 0) {"),
                new CodeLine("          pos--;"),
                new CodeLine("          help = help->next;"),
                new CodeLine("      }"),
                new CodeLine("      if (help != 0)"),
                new CodeLine("          return help->value;"),
                new CodeLine("      else cout << \"Error-accessElement\\n\";"),
                new CodeLine("  } else cout << \"Error-negativePos\\n\";"),
                new CodeLine("}")
            );
            let codeLine = 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (pos < 0)
                            codeLine = 10;
                        else codeLine = 2;
                        break;
                    case 2:
                        this._help = this._head;
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 3;
                        break;
                    case 3:
                        this._operationCode[codeLine].highlighted = true;
                        if (this._help !== null)
                            this._help.backGroundColor = 'orange';
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._help !== null && pos > 0)
                            codeLine = 4;
                        else
                            codeLine = 7;
                        break;
                    case 4:
                        this._operationCode[codeLine].highlighted = true;
                        pos--;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 5;
                        break;
                    case 5:
                        this._operationCode[codeLine].highlighted = true;
                        if (this._help !== null) {
                            this._help.backGroundColor = 'transparent';
                            this._help = this._help.next;
                            if (this._help !== null)
                                this._help.backGroundColor = 'orange';
                        }
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 3;
                        break;
                    case 7:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._help !== null)
                            codeLine = 8;
                        else codeLine = 9;
                        break;
                    case 8:
                        this._operationCode[codeLine].highlighted = true;
                        this._help.backGroundColor = 'green';
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 11;
                        break;
                    case 9:
                    case 10:
                        this._operationCode[codeLine].highlighted = true;
                        this._resultTextColor = "red";
                        this._resultText = "pos '" + posCopy + "' out of range";
                        this._showResultText = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 11;
                        break;
                    case 11:
                        this._operationCode[codeLine].highlighted = true;
                        this._help = null;
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

        /*
         * need to differ between the two options because
         * otherwise there would be unnecessary 'steps' (delays)
         */
        if (!this._showOperationCode) {
            let found = false;
            this._help = this._head;
            this._currentOperation = () => {
                if (this._help !== null && !found) {
                    this._help.backGroundColor = 'orange';
                    this.draw();
                    this._help.backGroundColor = 'transparent';
                    if (this._help.value === element) {
                        found = true;
                        this._help.backGroundColor = 'green';
                    } else
                        this._help = this._help.next;
                } else {
                    if (!found) {
                        this._resultTextColor = "red";
                        this._resultText = "'" + element + "' not found";
                        this._showResultText = true;
                    }
                    this._help = null;
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
                new CodeLine("  Element* help = head;"),
                new CodeLine("  while (help != 0 && help->value != a)"),
                new CodeLine("      help = help->next;"),
                new CodeLine("  if (help != 0)"),
                new CodeLine("      return 1;"),
                new CodeLine("  else return 0;"),
                new CodeLine("}")
            );
            let codeLine = 1;
            this._currentOperation = () => {
                switch (codeLine) {
                    case 1:
                        this._operationCode[codeLine].highlighted = true;
                        this._help = this._head;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 2;
                        break;
                    case 2:
                        this._operationCode[2].highlighted = true;
                        this._operationCode[3].highlighted = true;
                        if (this._help !== null)
                            this._help.backGroundColor = 'orange';
                        this.draw();
                        if (this._help !== null)
                            this._help.backGroundColor = 'transparent';
                        this._operationCode[2].highlighted = false;
                        this._operationCode[3].highlighted = false;

                        if (this._help !== null && this._help.value !== element)
                            this._help = this._help.next;
                        else
                            codeLine = 4;
                        break;
                    case 4:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        if (this._help !== null) {
                            this._help.backGroundColor = 'green';
                            codeLine = 5;
                        } else
                            codeLine = 6;
                        break;
                    case 5:
                        this._operationCode[codeLine].highlighted = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 7;
                        break;
                    case 6:
                        this._operationCode[codeLine].highlighted = true;
                        this._resultTextColor = "red";
                        this._resultText = "'" + element + "' not found";
                        this._showResultText = true;
                        this.draw();
                        this._operationCode[codeLine].highlighted = false;
                        codeLine = 7;
                        break;
                    case 7:
                        this._operationCode[codeLine].highlighted = true;
                        this._help = null;
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
     */
    countElements() {
        this._resetColors();
        let length = 0;

        // Set operationCode
        this._operationCode.length = 0;
        this._operationCode.push(
            new CodeLine("int List::Length() {"),
            new CodeLine("  Element* help = head;"),
            new CodeLine("  int length = 0;"),
            new CodeLine("  while (help != 0) {"),
            new CodeLine("      length++;"),
            new CodeLine("      help = help->next;"),
            new CodeLine("  }"),
            new CodeLine("  return length;"),
            new CodeLine("}")
        );
        let codeLine = 1;
        this._currentOperation = () => {
            switch (codeLine) {
                case 1:
                    this._operationCode[codeLine].highlighted = true;
                    this._help = this._head;
                    this.draw();
                    this._operationCode[codeLine].highlighted = false;
                    codeLine = 2;
                    break;
                case 2:
                    this._operationCode[codeLine].highlighted = true;
                    length = 0;
                    this._resultText = "Length: " + length;
                    this._resultTextColor = "green";
                    this._showResultText = true;
                    this.draw();
                    this._operationCode[codeLine].highlighted = false;
                    codeLine = 3;
                    break;
                case 3:
                    if (this._help !== null) {
                        this._operationCode[3].highlighted = true;
                        this._operationCode[4].highlighted = true;
                        this._operationCode[5].highlighted = true;
                        this._help.backGroundColor = 'orange';
                        length++;
                        this._resultText = "Length: " + length;
                    } else
                        this._operationCode[6].highlighted = true;
                    this.draw();
                    if (this._help !== null)
                        this._help.backGroundColor = 'transparent';
                    this._operationCode[3].highlighted = false;
                    this._operationCode[4].highlighted = false;
                    this._operationCode[5].highlighted = false;
                    this._operationCode[6].highlighted = false;

                    if (this._help !== null)
                        this._help = this._help.next;
                    else {
                        if (this.showOperationCode)
                            codeLine = 7;
                        else codeLine = 8;
                    }
                    break;
                case 7:
                    this._operationCode[codeLine].highlighted = true;
                    this.draw();
                    this._operationCode[codeLine].highlighted = false;
                    codeLine = 8;
                    break;
                case 8:
                    this._operationCode[codeLine].highlighted = true;
                    this._help = null;
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
     * @return {DynamicList}
     */
    copy() {
        let copy = new DynamicList(this._view, this._operatingFinishedCallback, this._speed);
        if (this._head !== null) {
            let help = this._head;
            copy.head = this._head.copy();
            help = help.next;
            let copyHelp = copy.head;
            while (help !== null) {
                copyHelp.next = help.copy();
                help = help.next;
                copyHelp = copyHelp.next;
            }
        }
        return copy;
    }

    /**
     * prints the list into the console
     */
    logList() {
        let help = this._head;
        let output = "{";
        while (help !== null) {
            output += "[" + help.value + "]";
            help = help.next;
        }
        output += "}";
        console.log(output);
    }

    /**
     * resets colors of all elements
     * @private
     */
    _resetColors() {
        let help = this._head;
        while (help !== null) {
            help.resetColors();
            help = help.next;
        }
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
     * @return {DynamicListView}
     */
    get view() {
        return this._view;
    }

    /**
     * Getter Method
     * @return {null||DynamicElement} head of the list
     */
    get head() {
        return this._head;
    }

    /**
     * Setter Method
     * @param {DynamicElement} value
     */
    set head(value) {
        this._head = value;
    }

    /**
     * Getter Method
     * @return {null|DynamicElement}
     */
    get help() {
        return this._help;
    }

    /**
     * Getter Method
     * @return {null|DynamicElement}
     */
    get help2() {
        return this._help2;
    }

    /**
     * Getter Method
     * @return {null|DynamicElement}
     */
    get helpElement() {
        return this._helpElement;
    }

    /**
     * Getter Method
     * @return {null|DynamicElement}
     */
    get helpAddNthElement() {
        return this._helpAddNthElement;
    }

    /**
     * Getter Method
     * Used in View to draw the list fully while inserting.
     * @return {null|DynamicElement}
     */
    get helpAddNthElementAct() {
        return this._helpAddNthElementAct;
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
 * elements to be stored in the DynamicList
 */
class DynamicElement {

    /**
     * constructs an element to be stored in the DynamicList
     * @param {string} value to be stored
     * @constructor
     */
    constructor(value) {
        this._backGroundColor = 'transparent';
        this._fontColor = 'black';
        this._strokeColor = 'black';
        this._xCoord = 0;
        this._yCoord = 0;
        this._value = value;
        this._next = null;
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
     * @return {DynamicElement}
     */
    copy() {
        let copy = new DynamicElement(this._value);
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

    get next() {
        return this._next;
    }

    set next(value) {
        this._next = value;
    }

    get xCoord() {
        return this._xCoord;
    }

    set xCoord(value) {
        this._xCoord = value;
    }

    get yCoord() {
        return this._yCoord;
    }

    set yCoord(value) {
        this._yCoord = value;
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