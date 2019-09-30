/*jshint esversion: 6*/
/*jslint node: true*/
/*global AVLTreeView*/
/*global AbstractAVLTree*/
/*global TAPE_OPERATION_ENUM*/
"use strict";

/**
 * Enum for Colors
 *
 * this colors can be used to highlight nodes
 * */
const COLOR_ENUM = {"DEFAULT": 1, "TRAVERSAL": 2, "ROTATION": 3, "DETECTED": 4, "INSERT": 5};
/**
 * Enum for Operations
 * */
const OPERATION_ENUM = {"FIND": 1, "INSERT": 2, "REMOVE": 3};

const CHECK_CHARACTER = " ✔"; //https://unicode-table.com/en/2714/ (accessed: 8.June 2019)
const CROSS_CHARACTER = " ❌"; //https://unicode-table.com/en/274C/ (accessed: 8.June 2019)

const MAX_RANDOM_VALUE = 999;
const MIN_VALUE_OF_TREE = -9999;
const MAX_VALUE_OF_TREE = 9999;

/**
 * Retrieves an random Value in the selected scope
 *
 * @param startInterval number can be reached
 * @param endInterval number can be reached
 * @return number
 * */
function randomValue(startInterval, endInterval) {
    console.assert(startInterval <= endInterval, "Interval valid assertion failed!");
    let result = startInterval - 1;
    while (result < startInterval || result > endInterval) {
        result = Math.floor((Math.random() * (endInterval - startInterval + 1)) + startInterval);
    }
    return result;
}

/**
 * Class represents node in an AVL-tree
 * */
class AVLNode {
    constructor(key) {
        this.key = key;
        this.rlink = null; //right child
        this.llink = null; //left child
        this.parent = null;
        this.balance = 0; //difference between height of children
        this.height = 1;
        this.color = COLOR_ENUM.DEFAULT; //color for view
    }

    /**
     * Copy constructor for a new AVLNode
     *
     * works recursive and copies all descendants too
     *
     * @param parent AVLNode (can be undefined)
     * @return AVLNode
     * */
    copy(parent) { //parent is the reference of the selected parent
        let currentNewNode = new AVLNode(this.key);
        currentNewNode.balance = this.balance;
        currentNewNode.height = this.height;
        currentNewNode.color = this.color;

        currentNewNode.parent = parent;
        if (this.llink) {
            currentNewNode.llink = this.llink.copy(currentNewNode);
        }
        if (this.rlink) {
            currentNewNode.rlink = this.rlink.copy(currentNewNode);
        }
        return currentNewNode;
    }

    /**
     * resets all colors of this node and his successors
     * */
    clearColors() {
        clear_step(this);

        function clear_step(currentNode) {
            if (currentNode) {
                currentNode.color = COLOR_ENUM.DEFAULT;

                clear_step(currentNode.llink);
                clear_step(currentNode.rlink);
            }
        }
    }
}

/**
 * AVL-tree class
 * */
class AVLTree extends AbstractAVLTree {
    /**
     * Constructor
     *
     * @param animationSpeed number: 0-10
     * @param view AVLTreeView
     * */
    constructor(animationSpeed, view) {
        super(animationSpeed);
        this.root = null;

        this.nextFunction = null;
        this.currentKey = null;
        this.currentNode = null;
        this.runningInterval = false;

        this.operationInfo = null;
        this.rotationInfo = null;
        this.operationParam = null;

        //initialize view (static variable)
        if (!AVLTree.view) {
            if (view) {
                AVLTree.view = view;
            } else {
                console.error("view can not be initialized!");
            }
        }

        //additional undo-functionality
        this.subOperationHistory = [];
    }

    /**
     * Saves tree and relevant params to sub-operation history array
     *
     * @param copyNodes boolean used, if next operation will manipulate the tree
     * */
    saveHistory(copyNodes) {
        if (this.subOperationHistory.length === 0) { //first state is copied (regardless of specified value)
            copyNodes = true;
        }

        //save relevant params:
        let currentState = {
            root: undefined,
            node_key: (this.currentNode) ? this.currentNode.key : null,
            op_info: this.operationInfo,
            rt_info: this.rotationInfo,
            nextFunction: this.nextFunction,
            param: this.operationParam
        };

        if (copyNodes) { //copy nodes
            currentState.root = this.root.copy(null);
        }
        else { //reference nodes
            currentState.root = this.subOperationHistory[this.subOperationHistory.length - 1].root;
        }

        this.subOperationHistory.push(currentState); //push to history
    }

    /**
     * drops all saved subStates of the current operation
     *
     * call at the end of the operation
     * */
    dropHistory() {
        this.subOperationHistory = [];
    }

    /**
     * Go one subOperation back
     *
     * @throws "runtime error!" if save was incorrect
     * */
    undo() {
        //previousSubOperation exists and no Interval is running
        if (!this.runningInterval && this.subOperationHistory.length > 1) {
            this.subOperationHistory.pop(); //last state of history is already on canvas

            let lastState = this.subOperationHistory[this.subOperationHistory.length - 1]; //retrieve last state

            if (this.subOperationHistory.length > 1) { //last saved state stays in storage
                lastState = this.subOperationHistory.pop();
            }

            //get params from history
            this.root = lastState.root.copy(null);
            this.operationInfo = lastState.op_info;
            this.rotationInfo = lastState.rt_info;
            this.nextFunction = lastState.nextFunction;
            this.operationParam = lastState.param;

            //find node with given key
            this.currentNode = null;
            if (lastState.node_key !== null) {
                let currentNode = this.root;
                let key = lastState.node_key;
                while (currentNode) {
                    if (currentNode.key === key) {
                        this.currentNode = currentNode; //node for key found
                        currentNode = null;
                    } else {
                        currentNode = (currentNode.key > key) ? currentNode.llink : currentNode.rlink;
                    }
                }
                if (this.currentNode === null) { //node is not in the tree (can not be a current node)
                    throw "runtime error!";
                }
            }
            //perform next function (to show output and manipulate tree)
            this.nextFunction(this.operationParam);
        }
    }

    /**
     * perform next step (like manual forward)
     *
     * if animation is running go to next position and start new interval
     * */
    redo() {
        let intervalWasRunning;
        if (this.runningInterval) { //stop running interval
            this.pauseOperation();
            intervalWasRunning = true;
        }
        //perform operation
        if (this.nextFunction) {
            this.nextFunction(this.operationParam); //perform next function, like in manual mode
        }
        if (intervalWasRunning && this.nextFunction) {
            this.resumeOperation(); //resume running interval
        }
    }

    /**
     * performs undo / redo operations
     *
     * @param operation TAPE_OPERATION_ENUM
     * */
    scrollTape(operation) {
        switch (operation) {
            case TAPE_OPERATION_ENUM.NEXT: //go to next position
                this.redo();
                break;
            case TAPE_OPERATION_ENUM.PREV: //go to previous position
                if (!this.runningInterval && this.subOperationHistory.length > 1) {
                    this.undo();
                }
                break;
            default:
                console.log("operation not valid for this tree!");
        }
    }

    startOfTape() {
        return this.subOperationHistory.length <= 1;
    }

    endOfTape() {
        return this.nextFunction === null;
    }

    /**
     * Copy constructor
     *
     * @return AVLTree (real copy, not a reference)
     * */
    copyTree() {
        let newTree = new AVLTree();

        if (this.root) {
            newTree.root = this.root.copy(null);
        }

        return newTree;
    }

    /**
     * Create a random Tree
     *
     * idea: start with root and fill tree with values, to get the selected height
     * @param height number between 0 and 5 (if undefined - random height between 1 and 5 gets selected)
     * */
    newTree(height) {
        //height undefined - set Random height
        if (height === undefined) {
            height = randomValue(1, 5);
        }
        //set defaults
        this.root = null;
        this.nextFunction = null;
        this.currentKey = null;
        this.currentNode = null;
        this.runningInterval = false;
        this.operationParam = null;
        this.operationInfo = null;
        if (this.interval) {
            clearInterval(this.interval);
        }

        //height in interval - create random tree
        if (height > 0 && height < 6) {
            let treeValid = false;
            while (!treeValid) {
                try {
                    this.root = addRandNode(height, 0, MAX_RANDOM_VALUE); //create Random tree (recursive, starting with root)
                    this.operationInfo = "RANDOM TREE";
                    treeValid = true;
                } catch (e) {
                    if (e === "invalid interval!") {
                        treeValid = false;
                    }
                    if (e === "height == 0!") {
                        treeValid = false;
                    }
                }
            }
        }
        //output of valid tree
        this.draw();

        /**
         * help function for recursive building of RandomTree
         *
         * @param height number height of node
         * @param minValue number possible minimum value of this node
         * @param maxValue number possible maximum value of this node
         * @param parent AVLNode parent of this node
         * @return AVLNode reference to new generated AVLNode
         * @throws "invalid interval!" if minValue > maxValue
         * @throws "height == 0!" if height == 0
         * */
        function addRandNode(height, minValue, maxValue, parent) {
            if (minValue > maxValue) { //impossible to retrieve a valid tree
                throw "invalid interval!";
            }

            if (height === 0) {
                throw "height == 0!";
            }

            //initialize node values
            let newNode = new AVLNode(randomValue(minValue, maxValue));
            newNode.parent = parent;
            newNode.height = height;
            newNode.balance = (newNode.height >= 2) ? randomValue(-1, 1) : 0;

            //node has children
            if (newNode.height > 1) {
                //left child
                if (newNode.height > 2 || (newNode.height === 2 && newNode.balance !== 1)) {
                    if (newNode.balance === 0 || newNode.balance === -1) { //left child has height - 1
                        newNode.llink = addRandNode(height - 1, minValue, newNode.key - 1, newNode);
                    } else { //left child has height - 2
                        newNode.llink = addRandNode(height - 2, minValue, newNode.key - 1, newNode);
                    }
                }
                //right child
                if (newNode.height > 2 || (newNode.height === 2 && newNode.balance !== -1)) {
                    if (newNode.balance === 0 || newNode.balance === 1) { //right child has height - 1
                        newNode.rlink = addRandNode(height - 1, newNode.key + 1, maxValue, newNode);
                    } else { //right child has height - 2
                        newNode.rlink = addRandNode(height - 2, newNode.key + 1, maxValue, newNode);
                    }
                }
            }
            return newNode;
        }
    }

    /**
     * print tree to view
     * */
    draw() {
        AVLTree.view.draw(this);
    }

    /**
     * check, if value is in the tree
     *
     * does not generate any output and does not manipulate this object
     * used for some return-values of visible steps
     *
     * @param key number: given value
     * @return boolean true: key is in the tree, false: key is not in the tree
     * */
    findWithNoOutput(key) {
        if (key === undefined || key === null) {
            return false;
        }

        let currentNode = this.root;
        while (currentNode) {
            if (currentNode.key === key) {
                return true; //success
            } else {
                currentNode = (currentNode.key > key) ? currentNode.llink : currentNode.rlink;
            }
        }
        return false; //no success
    }

    /**
     * sets start parameters for find
     *
     * find operation generates output
     * @param key number, value searched for
     * @return boolean true: key is in the tree, false: key is not in the tree
     * */
    find(key) {
        if (!this.root) { //tree is empty
            return false;
        }

        console.assert(!isNaN(key), "Key must be a number assertion!");

        this.nextFunction = this.find_step;
        this.operationParam = OPERATION_ENUM.FIND;
        this.operationInfo = "FIND:   " + key;
        this.currentKey = key;
        this.currentNode = this.root;
        this.startInterval();

        return this.findWithNoOutput(key);
    }

    /**
     * sets start parameters for add (with output)
     *
     * has additional logic to handle special cases (random, empty tree)
     * if the value is already in the tree output is generated, but nothing is added (key property)
     *
     * @param key number, value to insert (null for random)
     * @return boolean true: key could be added, false: key was already in the tree
     * */
    insert(key) {
        let result;
        if (key === undefined) { //!key would block 0
            key = randomValue(0, MAX_RANDOM_VALUE);
            while (this.findWithNoOutput(key)) { //Prevent duplicate values (insert would fail)
                ++key;
            }
        }

        if (key < MIN_VALUE_OF_TREE || key > MAX_VALUE_OF_TREE) { //key is out or range
            return false;
        }

        result = !(this.findWithNoOutput(key)); //If the value is already in the tree the operation fails.
        //can't return here, as nothing would be displayed!! (show find operation instead)

        if (this.root) { //standard case: tree is not empty
            this.nextFunction = this.find_step;
            this.operationParam = OPERATION_ENUM.INSERT;
            this.operationInfo = "ADD: " + key;
            this.currentKey = key;
            this.currentNode = this.root;
            this.startInterval();
            return result;
        } else { //insert value into empty tree
            this.root = new AVLNode(key);
            this.operationInfo = "ADD: " + key + CHECK_CHARACTER;
            this.draw();
            return true; //adding successful
        }
    }

    /**
     * sets start parameters for remove (with output)
     *
     * if the value is already in the tree output is generated, but nothing is removed
     *
     * @param key number, value to remove (undefined for random)
     * @return boolean true: key could be removed, false: key was not in the tree
     * */
    remove(key) {
        let result = false;
        if (this.root) { //standard case: tree is not empty
            if (key === undefined) { //random; !key would block 0
                //get random value:
                let keysInTree = this.toArray();
                key = keysInTree[randomValue(0, keysInTree.length - 1)];
            }
            //success, if value is in the tree; no success if not found (=as the definition at find)
            result = this.findWithNoOutput(key);
            this.nextFunction = this.find_step;
            this.operationParam = OPERATION_ENUM.REMOVE;
            this.operationInfo = "DEL: " + key;
            this.currentKey = key;
            this.currentNode = this.root;
            this.startInterval();
        }
        //else: empty, can't delete sth, result === false

        return result;
    }

    /**
     * Start animation
     *
     * if AnimationSpeed equals 0: do nothing. (User has to start next step himself)
     * @requires performNextFunction
     * */
    startInterval() {
        if (AVLTree.getAnimationSpeed() !== 0) {
            this.interval = setInterval(performNextFunction, AVLTree.getAnimationMilliseconds(), this);
            this.runningInterval = true;
        }

        /**
         * Performs next Step
         *
         * function is used in startInterval as it was not possible to use
         * this.nextFunction directly as function of the interval
         * @param that this.object of tree
         */
        function performNextFunction(that) {
            //Pause if manual mode gets activated during operation
            if (AVLTree.getAnimationSpeed() === 0) {
                that.pauseOperation();
            }
            that.nextFunction(that.operationParam);
        }
    }

    /**
     * Resume operation
     *
     * Used for Pause/Resume functionality
     * if AnimationSpeed equals 0: perform next operation
     * else: start new Interval
     * */
    resumeOperation() {
        if (this.nextFunction) {
            if (AVLTree.getAnimationSpeed() === 0) {
                this.nextFunction(this.operationParam);
            } else {
                if (!this.runningInterval) {
                    this.startInterval();
                }
            }
        }
    }

    /**
     * Pause operation
     *
     * used to stop running interval
     * @return boolean
     * */
    pauseOperation() {
        let success = false;
        if (this.interval && this.runningInterval) {
            clearInterval(this.interval);
            this.runningInterval = false;
            success = true;
        }
        return success;
    }

    /**
     * returns, if an operation is running
     *
     * @return boolean
     */
    isRunningOperation() {
        return this.nextFunction;
    }

    /**
     * returns, if an interval is active
     *
     * @return boolean
     *  */
    isRunningInterval() {
        return this.runningInterval;
    }

    /**
     * returns an array with all nodes of the current tree
     *
     * in-order traversal
     * @return array
     * */
    toArray() {
        return (this.root) ? addToArray(this.root, []) : [];

        function addToArray(currentNode, array) {
            if (currentNode.llink) {
                array = addToArray(currentNode.llink, array);
            }
            array[array.length] = currentNode.key;
            if (currentNode.rlink) {
                array = addToArray(currentNode.rlink, array);
            }
            return array;
        }
    }

    // noinspection OverlyComplexFunctionJS
    /**
     * performs find step
     *
     * prints output to the view
     * @param operation OPERATION_ENUM
     * */
    find_step(operation) {
        this.saveHistory(false);

        let currentNode = this.currentNode;

        //Value has not been detected as currentNode is undefined
        if (!currentNode) {
            switch (operation) {
                case OPERATION_ENUM.INSERT: //Can insert value
                    this.operationInfo += CHECK_CHARACTER;
                    this.add_step();
                    break;
                case OPERATION_ENUM.FIND: //Can not find value
                case OPERATION_ENUM.REMOVE: //Can not remove value (does not exist)
                    this.operationInfo += CROSS_CHARACTER;
                    this.nextFunction = this.endOperation_step;
                    break;
                default:
                    console.error("find_step with operation: " + operation);
                    break;
            }
            return;
        }

        //output
        currentNode.color = COLOR_ENUM.TRAVERSAL;
        this.draw();
        currentNode.color = COLOR_ENUM.DEFAULT;

        //value has been detected at this node
        if (currentNode.key === this.currentKey) {
            switch (operation) {
                case OPERATION_ENUM.REMOVE:
                    this.operationInfo += CHECK_CHARACTER;
                    this.nextFunction = this.remove_step;
                    break;
                case OPERATION_ENUM.INSERT: //Value is in the tree (insert not possible, just mark it as detected)
                    this.operationInfo += CROSS_CHARACTER;
                    this.nextFunction = this.markDetected_step;
                    break;
                case OPERATION_ENUM.FIND:
                    this.operationInfo += CHECK_CHARACTER;
                    this.nextFunction = this.markDetected_step;
                    break;
                default:
                    console.error("find_step with operation: " + operation);
            }
            return;
        }

        //search children:
        this.currentNode = (currentNode.key > this.currentKey) ? currentNode.llink : currentNode.rlink;
    }

    /**
     * highlights node
     *
     * prints output to the view
     */
    markDetected_step() {
        this.saveHistory();
        this.currentNode.color = COLOR_ENUM.DETECTED;
        this.draw();
        this.currentNode.color = COLOR_ENUM.DEFAULT;
        this.nextFunction = this.endOperation_step;
    }

    /**
     * performs add operation
     *
     * prints output to the view
     * executed after find_step (just if value is not in the tree)
     * */
    add_step() {
        let currentNode;
        let parentNode;

        console.assert(this.root, "Root assumption failed!");

        //traverse tree: identify correct position and parent node
        currentNode = this.root;
        while (currentNode !== null) {
            if (currentNode.key > this.currentKey) {
                parentNode = currentNode;
                currentNode = currentNode.llink;
            }
            else if (currentNode.key < this.currentKey) {
                parentNode = currentNode;
                currentNode = currentNode.rlink;
            } else {
                this.operationInfo += CROSS_CHARACTER;
                this.nextFunction = this.markDetected_step;
                return;
            }
        }

        console.assert(parentNode, "Root assumption failed!");
        console.assert(!currentNode, "Node assumption failed!");

        //generate new node
        currentNode = new AVLNode(this.currentKey);

        //set references between new node and its parent
        if (parentNode.key > currentNode.key) {
            parentNode.llink = currentNode;
        }
        else if (parentNode.key < currentNode.key) {
            parentNode.rlink = currentNode;
        }
        currentNode.parent = parentNode;

        //output
        currentNode.color = COLOR_ENUM.INSERT;
        this.draw();
        currentNode.color = COLOR_ENUM.DEFAULT;

        //updates of the height (and balance-factors) in the ancestor-nodes
        this.nextFunction = this.check_step;
        this.currentNode = parentNode;
    }

    // noinspection OverlyComplexFunctionJS
    /**
     * performs remove operation
     *
     * prints output to the view
     * executed after find_step (just if value is in the tree)
     * assumes that this.currentNode points on the node to remove
     */
    remove_step() {
        let currentNode = this.currentNode;
        let parentNode = currentNode.parent;

        this.saveHistory(true);

        console.assert(this.currentKey === this.currentNode.key, "Already right node assumption!");

        //output (mark node as detected)
        currentNode.color = COLOR_ENUM.DETECTED;
        this.draw();
        currentNode.color = COLOR_ENUM.DEFAULT;

        //node has no children (leaf)
        if (!currentNode.llink && !currentNode.rlink) {
            //key is the last one in the tree
            if (parentNode === null) {
                this.root = null;
                this.nextFunction = this.endOperation_step;
            }
            else {
                //remove the reference to this node
                if (parentNode.key > currentNode.key) {
                    parentNode.llink = null;
                }
                else if (parentNode.key < currentNode.key) {
                    parentNode.rlink = null;
                }

                this.currentNode = parentNode;
                this.nextFunction = this.check_step;
            }
        }
        //node has two children (replace with in-order predecessor)
        else if (currentNode.llink && currentNode.rlink) {
            //find in order predecessor:
            let inOrderPredecessorNode = currentNode.llink;
            let inOrderPredecessorParent;
            while (inOrderPredecessorNode.rlink) {
                inOrderPredecessorNode = inOrderPredecessorNode.rlink;
            }
            inOrderPredecessorParent = inOrderPredecessorNode.parent;

            //replace key with key of in-order predecessor
            currentNode.key = inOrderPredecessorNode.key;

            //in order predecessor was left child of deleted node
            if (inOrderPredecessorParent === currentNode) {
                currentNode.llink = inOrderPredecessorNode.llink;
            }
            //predecessor was not the left child
            else {
                inOrderPredecessorParent.rlink = inOrderPredecessorNode.llink;
            }

            //move left subtree of predecessor upwards (if there exits one)
            if (inOrderPredecessorNode.llink) {
                inOrderPredecessorNode = inOrderPredecessorNode.llink;
                inOrderPredecessorNode.parent = inOrderPredecessorParent;
            }

            this.currentNode = inOrderPredecessorNode;
            this.nextFunction = this.check_step;
        }
        //node has one child (replace with child)
        else {
            //find subtree (childNode replaces currentNode
            let childNode = (currentNode.rlink) ? currentNode.rlink : currentNode.llink;
            childNode.parent = parentNode;

            //no parent node => current node is the root
            if (parentNode === null) {
                this.root = childNode;
            }
            //update references at the parent node
            else {
                if (parentNode.key > childNode.key) {
                    parentNode.llink = childNode;
                }
                else if (parentNode.key < childNode.key) {
                    parentNode.rlink = childNode;
                }
            }

            this.currentNode = childNode;
            this.nextFunction = this.check_step;
        }
    }

    /**
     * checks node
     *
     * used for bottom-up traversal of the tree
     * recalculates height and balance of nodes
     * starts rotations, if necessary
     * prints output to the view
     */
    check_step() {
        let currentNode = this.currentNode;
        let leftHeight = (currentNode.llink) ? currentNode.llink.height : 0;
        let rightHeight = (currentNode.rlink) ? currentNode.rlink.height : 0;

        this.saveHistory(true);

        //recalculate height and balance
        currentNode.height = Math.max(leftHeight, rightHeight) + 1;
        currentNode.balance = rightHeight - leftHeight;

        //output
        currentNode.color = COLOR_ENUM.TRAVERSAL;
        this.draw();
        this.root.clearColors();

        //check for rotations
        //right subtree is higher
        if (currentNode.balance === 2) {
            //right-left rotation
            if (currentNode.rlink.balance === -1) {
                this.rotationInfo = "Right-Left-Rotation";
                this.nextFunction = this.rightLeftRotation_step;
                this.operationParam = false;
            }
            //left rotation
            else {
                this.rotationInfo = "Left-Rotation";
                this.nextFunction = this.leftRotation_step;
                this.operationParam = true;
            }
        }
        //left subtree is higher
        else if (currentNode.balance === -2) {
            //left-right rotation
            if (currentNode.llink.balance === 1) {
                this.rotationInfo = "Left-Right-Rotation";
                this.nextFunction = this.leftRightRotation_step;
                this.operationParam = false;
            }
            //right rotation
            else {
                this.rotationInfo = "Right-Rotation";
                this.nextFunction = this.rightRotation_step;
                this.operationParam = true;
            }
        }
        //no rotation necessary
        else {
            if (currentNode.parent) { //if not root
                this.currentNode = currentNode.parent;
            } else {
                this.nextFunction = this.endOperation_step;
            }
        }
    }

    /**
     * performs right rotation
     *
     * also part of left-right rotation
     * @param singleRotation boolean true: just right rotation, false: part of left-right rotation
     * */
    rightRotation_step(singleRotation) {
        let nodeP = this.currentNode.parent; //is parent of A -> gets parent of B
        let nodeA = this.currentNode; //is parent of B / child of P -> gets right child of B / parent of H
        let nodeB = nodeA.llink; //is parent of H / left child of A -> gets parent of A / child of P
        let nodeH = nodeB.rlink; //is right child of B -> gets left child of A

        this.saveHistory(true);

        //output before rotation
        nodeA.color = COLOR_ENUM.ROTATION;
        nodeB.color = COLOR_ENUM.ROTATION;
        nodeB.llink.color = COLOR_ENUM.ROTATION;
        this.draw();

        //P - B
        nodeB.parent = nodeP;
        if (nodeP) {
            if (nodeP.key > nodeB.key) {
                nodeP.llink = nodeB;
            }
            else {
                nodeP.rlink = nodeB;
            }
        }
        //B - A
        nodeA.parent = nodeB;
        nodeB.rlink = nodeA;
        //A - H
        nodeA.llink = nodeH;
        if (nodeH) {
            nodeH.parent = nodeA;
        }

        //root changed (A was root -> B gets new root)
        if (this.root.parent) {
            this.root = this.root.parent;
        }

        //next operation depends on rotation type
        this.nextFunction = (singleRotation) ? this.check_step : this.checkRightSubbranch_step;
    }

    /**
     * performs left rotation
     *
     * also part of right-left rotation
     * @param singleRotation boolean true: just left Rotation, false: part of right-left rotation
     * */
    leftRotation_step(singleRotation) {
        let nodeP = this.currentNode.parent; //is parent of A -> gets parent of B
        let nodeA = this.currentNode; //is parent of B / child of P -> gets left child of B / parent of H
        let nodeB = nodeA.rlink; //is parent of H / right child of A -> gets parent of A / child of P
        let nodeH = nodeB.llink; //is left child of B -> gets right child of A

        this.saveHistory(true);

        //output before rotation
        nodeA.color = COLOR_ENUM.ROTATION;
        nodeB.color = COLOR_ENUM.ROTATION;
        nodeB.rlink.color = COLOR_ENUM.ROTATION;
        this.draw();

        //P - B
        nodeB.parent = nodeP;
        if (nodeP) {
            if (nodeP.key > nodeB.key) {
                nodeP.llink = nodeB;
            }
            else {
                nodeP.rlink = nodeB;
            }
        }
        //B - A
        nodeA.parent = nodeB;
        nodeB.llink = nodeA;
        //A - H
        nodeA.rlink = nodeH;
        if (nodeH) {
            nodeH.parent = nodeA;
        }

        //root changed (A was root -> B gets new root)
        if (this.root.parent) {
            this.root = this.root.parent;
        }

        //next operation depends on rotation type
        this.nextFunction = (singleRotation) ? this.check_step : this.checkLeftSubbranch_step;
    }

    /**
     * performs first part of left-right rotation
     *
     * uses right rotation for second part
     * */
    leftRightRotation_step() {
        let nodeA = this.currentNode; //is parent of B -> gets parent of C
        let nodeB = nodeA.llink; //is left child of A / parent of C -> gets left child of C / parent of H
        let nodeC = nodeB.rlink; //is right child of B / parent of H -> gets left child of A / parent of B
        let nodeH = nodeC.llink; //is left child of C -> gets right child of B

        this.saveHistory(true);

        //output before first part of the rotation:
        nodeA.color = COLOR_ENUM.ROTATION;
        nodeB.color = COLOR_ENUM.ROTATION;
        nodeC.color = COLOR_ENUM.ROTATION;
        this.draw();
        nodeA.clearColors();

        //A - C
        nodeA.llink = nodeC;
        nodeC.parent = nodeA;
        //C - B
        nodeC.llink = nodeB;
        nodeB.parent = nodeC;
        //B - H
        nodeB.rlink = nodeH;
        if (nodeH) {
            nodeH.parent = nodeB;
        }

        this.nextFunction = this.rightRotation_step;
    }

    /**
     * performs first part of right-left rotation
     *
     * uses left rotation for second part
     * */
    rightLeftRotation_step() {
        let nodeA = this.currentNode; //is parent of B -> gets parent of C
        let nodeB = nodeA.rlink; //is right child of A / parent of C -> gets right child of C / parent of H
        let nodeC = nodeB.llink; //is left child of B / parent of H -> gets right child of A / parent of B
        let nodeH = nodeC.rlink; //is right child of C -> gets left child of B

        this.saveHistory(true);

        //output before first part of the rotation
        nodeA.color = COLOR_ENUM.ROTATION;
        nodeB.color = COLOR_ENUM.ROTATION;
        nodeC.color = COLOR_ENUM.ROTATION;
        this.draw();
        nodeA.clearColors();

        //A - C
        nodeA.rlink = nodeC;
        nodeC.parent = nodeA;
        //C - B
        nodeC.rlink = nodeB;
        nodeB.parent = nodeC;
        //B - H
        nodeB.llink = nodeH;
        if (nodeH) {
            nodeH.parent = nodeB;
        }

        this.nextFunction = this.leftRotation_step;
    }

    /**
     * check after right-left-rotation
     *
     * checks node, makes output and calls check
     * (call in left rotation)
     * */
    checkRightSubbranch_step() {
        let currentNode = this.currentNode;
        let leftHeight = (currentNode.llink) ? currentNode.llink.height : 0;
        let rightHeight = (currentNode.rlink) ? currentNode.rlink.height : 0;

        this.saveHistory(true);

        currentNode.height = Math.max(leftHeight, rightHeight) + 1;
        currentNode.balance = rightHeight - leftHeight;

        //output:
        currentNode.color = COLOR_ENUM.TRAVERSAL;
        currentNode.parent.color = COLOR_ENUM.ROTATION;
        currentNode.parent.llink.color = COLOR_ENUM.ROTATION;
        this.draw();
        currentNode.color = COLOR_ENUM.ROTATION;


        this.currentNode = currentNode.parent.llink;
        this.nextFunction = this.check_step;
    }

    /**
     * check after left-right rotation
     *
     * checks node, makes output and calls check
     * (call in right rotation)
     * */
    checkLeftSubbranch_step() {
        let currentNode = this.currentNode;
        let leftHeight = (currentNode.llink) ? currentNode.llink.height : 0;
        let rightHeight = (currentNode.rlink) ? currentNode.rlink.height : 0;

        this.saveHistory(true);

        currentNode.height = Math.max(leftHeight, rightHeight) + 1;
        currentNode.balance = rightHeight - leftHeight;

        //output:
        currentNode.color = COLOR_ENUM.TRAVERSAL;
        currentNode.parent.color = COLOR_ENUM.ROTATION;
        currentNode.parent.rlink.color = COLOR_ENUM.ROTATION;
        this.draw();
        currentNode.color = COLOR_ENUM.ROTATION;

        this.currentNode = currentNode.parent.rlink;
        this.nextFunction = this.check_step;
    }

    /**
     * last step of an insert/find/remove operation
     *
     * clears all colors in the tree
     * resets nextFunction
     * */
    endOperation_step() {
        if (this.root) {
            this.root.clearColors();
        }
        this.rotationInfo = null;
        //this.operationInfo = null; //activate if output should not be displayed after end of operation
        this.draw();
        this.nextFunction = null;
        this.pauseOperation();
        this.dropHistory();
    }
    
    /**
     * retrieves animation speed
     *
     * speed is dropping linearly between 1 and 5 (k=500)
     * speed is dropping linearly between 5 and 10 (k=190)
     * => (1, 3000), (5, 1000), (10, 50)
     * @return number milliseconds 50 - 3000, Infinity if manual mode
     * */
    static getAnimationMilliseconds() {
        let ms;
        let currentSpeed = AbstractAVLTree.getAnimationSpeed();
        if (currentSpeed === 0) {
            ms = Infinity;
        } else if (currentSpeed <= 5) {
            ms = 3000 - (currentSpeed - 1) * 500; //1000 = 1 second
        } else {
            ms = 1000 - (currentSpeed - 5) * 190;
        }
        return ms;
    }
}

//static variable:
AVLTree.view = null;