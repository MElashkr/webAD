/*jshint esversion: 6*/
/*jslint node: true*/
/*global AVLTree*/
/*global AbstractAVLTree*/
"use strict";

/**
 * all possible tape operations
 * */
const TAPE_OPERATION_ENUM = {"FIRST": 1, "PREV": 2, "NEXT": 3, "LAST": 4};

/**
 * Proxy for tape recorder-approach
 *
 * This class is used in between the html file and the actual AVL-Tree class.
 * The idea is to encapsulate the tape recorder functionality.
 *
 * @param animationSpeed number between 0-10
 * @param view AVLTreeView component
 */
class ProxyAVLTree extends AbstractAVLTree {
    constructor(animationSpeed, view) {
        super(animationSpeed);
        //variables for stack-functionality
        this.currentState = 0;
        this.lastState = 0;
        this.treeHistory = [];

        //initialize the first treeState (empty AVL-Tree)
        this.treeHistory[this.currentState] = new AVLTree(animationSpeed, view);

        //draw the first treeState
        this.draw();
    }

    /**
     * creates a new empty tree
     *
     * @param height number between 0 and 5 or undefined for random height between 1 and 5
     * @return boolean true: change happened, false: tree already empty
     * */
    newTree(height) {
        let success = false;
        if (height === 0) { //create an empty tree
            if (this.treeHistory[this.currentState].root) { //root is defined
                ++this.currentState;
                this.lastState = this.currentState;

                this.treeHistory[this.currentState] = new AVLTree();
                this.draw();
                success = true;
            }
        } else { //create an random tree
            if (height >= 1 && height <= 5 || height === undefined) {
                ++this.currentState;
                this.lastState = this.currentState;

                this.treeHistory[this.currentState] = new AVLTree();
                this.treeHistory[this.currentState].newTree(height);
                this.draw();
                success = true;
            }
        }
        return success;
    }

    /**
     * print current tree to view
     * */
    draw() {
        this.treeHistory[this.currentState].draw();
    }

    /**
     * insert a new node in the tree
     *
     * if this value does already exist the find steps are executed, but no entry on the tape is made
     * in case of success positions on the tape after the current state get lost.
     *
     * @param key value that should be inserted to the tree
     * @return boolean true: success, false: no success
     * */
    insert(key) {
        if (key === undefined || this.treeHistory[this.currentState].findWithNoOutput(key) === false) {
            //copy current tree
            this.treeHistory[this.currentState + 1] = (this.treeHistory[this.currentState]).copyTree();
            ++this.currentState;
            this.lastState = this.currentState;
        }
        return this.treeHistory[this.currentState].insert(key);
    }

    /**
     * remove a node from the tree
     *
     * if this value does not exist, find steps are executed, but no entry on the tape is made
     * in case of success, positions on the tape after the current state get lost.
     *
     * @param key value that should be removed from the tree
     * @return boolean true: success, false: no success (value is not in the tree)
     * */
    remove(key) {
        if (key === undefined && this.treeHistory[this.currentState].root !== null || this.treeHistory[this.currentState].findWithNoOutput(key)) {
            //copy current tree
            this.treeHistory[this.currentState + 1] = (this.treeHistory[this.currentState]).copyTree();
            ++this.currentState;
            this.lastState = this.currentState;
        }
        return this.treeHistory[this.currentState].remove(key);
    }

    /**
     * search for a node in the tree
     *
     * @param key value to search for
     * @return boolean true: success, false: no success
     * */
    find(key) {
        return this.treeHistory[this.currentState].find(key);
    }

    /**
     * resume (stopped animation) / next (manual mode)
     *
     * part of the play/pause functionality
     * */
    resumeOperation() {
        this.treeHistory[this.currentState].resumeOperation();
    }

    /**
     * pause (current animation)
     *
     * part of the play/pause functionality
     * @return boolean
     * */
    pauseOperation() {
        return this.treeHistory[this.currentState].pauseOperation();
    }

    /**
     * operation is running
     *
     * @return boolean
     */
    isRunningOperation() {
        return this.treeHistory[this.currentState].isRunningOperation();
    }

    /**
     * returns, if an interval is active
     *
     * @return boolean
     *  */
    isRunningInterval() {
        return this.treeHistory[this.currentState].isRunningInterval();
    }

    // noinspection OverlyComplexFunctionJS
    /**
     * tape recorder
     *
     * moves tape according to selected operation
     * @param operation TAPE_OPERATION_ENUM
     * @throws "runtime error!" if undo did not perform correctly
     * */
    scrollTape(operation) {
        let oldState = this.currentState;

        if (this.treeHistory[this.currentState].isRunningOperation()) { //running operation - delegate to currentTree
            this.treeHistory[this.currentState].scrollTape(operation);
        } else {
            switch (operation) {
                case TAPE_OPERATION_ENUM.FIRST: //go to first position
                    this.currentState = 0;
                    break;
                case TAPE_OPERATION_ENUM.LAST: //go to last position
                    this.currentState = this.lastState;
                    break;
                case TAPE_OPERATION_ENUM.NEXT: //go to next position
                    if (this.currentState < this.lastState) {
                        ++this.currentState;
                    }
                    break;
                case TAPE_OPERATION_ENUM.PREV: //go to previous position
                    if (this.currentState > 0) {
                        --this.currentState;
                    }
                    break;
                default:
                    console.error("This is no valid operation for the tape!");
            }
        }
        //draw if sth has changed
        if (oldState !== this.currentState) {
            this.draw();
        }
    }

    /**
     * start of tape (no historical state)
     *
     * @return boolean
     * */
    startOfTape() {
        return this.currentState === 0;
    }

    /**
     * end of tape (no state in the future)
     *
     * @return boolean
     * */
    endOfTape() {
        return this.currentState === this.lastState;
    }
}