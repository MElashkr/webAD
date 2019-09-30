/*jshint esversion: 6*/
/*jslint node: true*/
/*global Kinetic */
/*global COLOR_ENUM */
"use strict";

//Constants for view:
const BASIC_RADIUS = 20;
const BASIC_SPACE = 5;

const PRIMARY_COLOR = "#92d3ed";
const PRIMARY_COLOR_DARKER = "#2196c4";
const PRIMARY_COLOR_LIGHTER = "#d3edf8";
const TRAVERSAL_COLOR = "#ebeb89";
const DETECTED_COLOR = "#89eb89";
const INSERT_COLOR = "#eb89d3";
const ROTATION_COLOR = "#eba289";
const FONT_COLOR = "Black";

const WIDTH_OF_STAGE = 1000;
const HEIGHT_OF_STAGE = 400;

const ZOOM_MIN = 0.2;
const ZOOM_MAX = 1.9;
const ZOOM_STEP = 0.1;

/**
 * Graphical output component for AVL tree
 *
 * Used for the graphical representation of a tree.
 * Uses KineticJS Library.
 *
 * @param cont is the html-Element where the output is shown.
 */
class AVLTreeView {
    constructor(cont) {
        this.scale = 1;
        this.horizontalCenter = (WIDTH_OF_STAGE / 2) / this.scale; //center of stage
        this.showOperationInfo = true;
        this.showBalanceColor = true;
        this.showHeightInfo = true;
        this.showHeightInfoOfEmptyNodes = true;
        this.layerOffset = {x: 0, y: 0};

        this.stage = new Kinetic.Stage({
            container: cont,
            draggable: false,
            width: WIDTH_OF_STAGE,
            height: HEIGHT_OF_STAGE
        });

        this.lastModel = null;
    }

    zoomIn() {
        if (this.scale < ZOOM_MAX) {
            this.scale += ZOOM_STEP;
            this.horizontalCenter = (WIDTH_OF_STAGE / 2) / this.scale; //center of stage
            this.refresh();
        }
    }

    /**
     * zoom out
     *
     * limit is at 0.2, as outputs of scale showed values like 0.2000000000001
     * -> actual limit is 0.1
     * */
    zoomOut() {
        if (this.scale > ZOOM_MIN) {
            this.scale -= ZOOM_STEP;
            this.horizontalCenter = (WIDTH_OF_STAGE / 2) / this.scale; //center of stage
            this.refresh();
        }
    }

    /**
     * Get root back to center of the screen and set scale to 1
     * */
    setToDefault() {
        this.scale = 1;
        this.horizontalCenter = WIDTH_OF_STAGE / 2;
        this.stage.getLayers()[0].setX(0);
        this.stage.getLayers()[0].setY(0);
        this.refresh();
    }

    /**
     * toggle operation information on/off
     *
     * @param state boolean (true: show information)
     * */
    setOperationInfo(state) {
        let oldState = this.showOperationInfo;
        this.showOperationInfo = state;
        if (oldState !== this.showOperationInfo) {
            this.refresh();
        }
    }

    /**
     * toggle color code for balance information on/off
     *
     * @param state boolean (true: use color code)
     * */
    setBalanceColor(state) {
        let oldState = this.showBalanceColor;
        this.showBalanceColor = state;
        if (oldState !== this.showBalanceColor) {
            this.refresh();
        }
    }

    /**
     * toggle height information on/off
     *
     * @param state boolean (true: show information)
     * */
    setHeightInfo(state) {
        let oldState = this.showHeightInfo;
        this.showHeightInfo = state;
        if (oldState !== this.showHeightInfo) {
            this.refresh();
        }
    }

    /**
     * toggle height information on/off
     *
     * @param state boolean (true: show information)
     * */
    setHeightInfoOfEmptyNode(state) {
        let oldState = this.showHeightInfoOfEmptyNodes;
        this.showHeightInfoOfEmptyNodes = state;
        if (oldState !== this.showHeightInfoOfEmptyNodes && this.showHeightInfo) {
            this.refresh();
        }
    }

    /**
     * print view of last model using current view-settings
     * */
    refresh() {
        if (this.lastModel) {
            //Tree is not empty
            if (this.lastModel.root) {
                //save layer offset
                let layer = this.stage.getLayers()[0];
                this.layerOffset = {x: layer.getX(), y: layer.getY()};

                this.stage.removeChildren();

                this.layer = this.newLayer(true);

                this.newNode(this.lastModel.root, 0, this.heightOfTree);
                this.stage.add(this.layer);

                if (this.showOperationInfo) { //information regarding the current operation
                    let informationLayer = this.printInformation(this.lastModel.operationInfo, this.lastModel.rotationInfo);
                    this.stage.add(informationLayer);
                }
                this.stage.draw();
            } else {
                let informationLayer = this.printInformation("EMPTY TREE");
                this.stage.removeChildren();
                this.stage.add(informationLayer);
                this.stage.draw();
            }
        }
    }

    /**
     * output of the model
     *
     * @param model AVLTree
     * */
    draw(model) {
        if (this.stage.getChildren()[0] && this.lastModel.root) { //stage must be defined. LastModel should not be empty, as empty models always have an offset of (0/0)
            //save layer offset
            let layer = this.stage.getLayers()[0];
            this.layerOffset = {x: layer.getX(), y: layer.getY()};
        }

        this.lastModel = model.copyTree(); //cache model
        this.lastModel.operationInfo = model.operationInfo;
        this.lastModel.rotationInfo = model.rotationInfo;

        this.stage.removeChildren();

        if (model.root) { //tree is not empty
            this.heightOfTree = AVLTreeView.getHeightOfModel(model.root);
            this.layer = this.newLayer(true); //layer for nodes

            //print tree
            this.newNode(model.root, 0, this.heightOfTree);
            this.stage.add(this.layer);

            if (this.showOperationInfo) { //information regarding the current operation
                let informationLayer = this.printInformation(model.operationInfo, model.rotationInfo);
                this.stage.add(informationLayer);
            }
        }
        else { //tree is empty
            let informationLayer = this.printInformation("EMPTY TREE");
            this.stage.add(informationLayer);
        }
        this.stage.draw(); //draw stage
    }

    /**
     * Adds a node to the layer
     *
     * function is recursive and performs automatically the same operation for its children
     *
     * @param node AVLNode, should be printed
     * @param rowIndex integer, position of node in its row (starting with 0 on the outer-left position), empty positions have their own index
     * @param heightOfNode integer, position in tree (can't use the nodes height attribute, as this might not be in the correct order)
     * */
    newNode(node, rowIndex, heightOfNode) {
        console.assert(node && !isNaN(rowIndex) && !isNaN(heightOfNode), "Parameter assertion failed!");

        //calculating the maximum row-index for the given height:
        let maxRowIndex = Math.pow(2, (this.heightOfTree - heightOfNode)) - 1;

        //calculating x-offset from center of the layer:
        let xOffsetFromCenter = ((BASIC_RADIUS + BASIC_SPACE) * Math.pow(2, heightOfNode - 1)) * (maxRowIndex - (maxRowIndex - rowIndex) * 2);

        //calculating x and y position of the center of the node:
        let x = this.horizontalCenter + xOffsetFromCenter;
        let y = ((this.heightOfTree - heightOfNode) * 2 + 1) * (BASIC_RADIUS + BASIC_SPACE);

        //calculating center of child-nodes (for lines)
        let yChildPosition = y + 2 * (BASIC_RADIUS + BASIC_SPACE); //y position of child
        let xChildOffset; //offset from x position of node (child-x-position at x +/- x-child-offset)
        xChildOffset = (heightOfNode >= 2) ? (BASIC_RADIUS + BASIC_SPACE) * Math.pow(2, heightOfNode - 2) : BASIC_RADIUS;

        //links to children: line visiting 3 Points(left child, node, right child)
        this.layer.add(new Kinetic.Line({
            x: 0,
            y: 0,
            points: [x - xChildOffset, yChildPosition, x, y, x + xChildOffset, yChildPosition],
            stroke: FONT_COLOR,
            strokeWidth: 2
        }));

        this.printNode(node, x, y, rowIndex); //print actual node

        //recursive printing of children (if there are any):
        if (node.llink) {
            this.newNode(node.llink, rowIndex * 2, heightOfNode - 1);
        }
        else if (this.showHeightInfo && this.showHeightInfoOfEmptyNodes) { //print height 0
            this.layer.add(new Kinetic.Text({
                x: x - xChildOffset - 4,
                y: yChildPosition + 7,
                text: '0',
                fontSize: 15,
                fill: FONT_COLOR,
                align: 'center'
            }));
        }
        if (node.rlink) {
            this.newNode(node.rlink, rowIndex * 2 + 1, heightOfNode - 1);
        }
        else if (this.showHeightInfo && this.showHeightInfoOfEmptyNodes) { //print height 0
            this.layer.add(new Kinetic.Text({
                x: x + xChildOffset - 4,
                y: yChildPosition + 7,
                text: '0',
                fontSize: 15,
                fill: FONT_COLOR,
                align: 'center'
            }));
        }
    }

    /**
     * Creates a new Kinetic Layer
     *
     * @param draggable boolean true/false
     * @return Kinetic.Layer
     * */
    newLayer(draggable) {
        if (draggable === undefined || draggable === null) {
            draggable = false;
        }
        return new Kinetic.Layer({
            clearBeforeDraw: true,
            x: draggable ? this.layerOffset.x : 0,
            y: draggable ? this.layerOffset.y : 0,
            width: 1000,
            height: 400,
            visible: true,
            scaleX: this.scale,
            scaleY: this.scale,
            draggable: draggable
        });
    }

    /**
     * retrieves correct height of tree
     *
     * Problem: root-rotations may cause that height value of root node does not show the correct height
     * is inline
     * @param root AVLNode root of the model
     * @return height of tree
     * */
    static getHeightOfModel(root) {
        let height = root.height;
        if (root.rlink && root.rlink.height > height) {
            height = root.rlink.height;
        }
        if (root.llink && root.llink.height > height) {
            height = root.llink.height;
        }
        if (root.llink && root.height === root.llink.height &&
            root.rlink && root.height === root.rlink.height) { //catches case, where root-node changes due to rotation
            height = root.height + 1;
        }
        return height;
    }

    /**
     * finds correct color for enum value
     * is inline
     *
     * @param color COLOR_ENUM
     * @param balance number out of {-1,0,1}
     * @return string
     * */
    getColorForNode(color, balance) {
        let fillColor = PRIMARY_COLOR;
        switch (color) {
            case COLOR_ENUM.DEFAULT:
                //change color, depending on balance-factor
                if (this.showBalanceColor) {
                    if (balance === -1) {
                        fillColor = PRIMARY_COLOR_DARKER;
                    }
                    else if (balance === 1) {
                        fillColor = PRIMARY_COLOR_LIGHTER;
                    }
                }
                break;
            case COLOR_ENUM.TRAVERSAL:
                fillColor = TRAVERSAL_COLOR;
                break;
            case COLOR_ENUM.ROTATION:
                fillColor = ROTATION_COLOR;
                break;
            case COLOR_ENUM.DETECTED:
                fillColor = DETECTED_COLOR;
                break;
            case COLOR_ENUM.INSERT:
                fillColor = INSERT_COLOR;
                break;
            default: //error case
                console.error("Undefined Color State: " + color);
                fillColor = "black";
        }
        return fillColor;
    }

    /**
     * Create actual Kinetic Objects for Node
     *
     * @param node AVLNode information of node
     * @param x number x position of center
     * @param y number y position of center
     * @param rowIndex position of node in line
     * */
    printNode(node, x, y, rowIndex) {
        //node: circle (color depending on attributes)
        let fillColor = this.getColorForNode(node.color, node.balance);

        //add node to layer
        this.layer.add(new Kinetic.Circle({
            radius: BASIC_RADIUS,
            fill: fillColor,
            x: x,
            y: y
        }));

        //text: text (prints the key of the node)
        this.layer.add(new Kinetic.Text({
            x: x - BASIC_RADIUS,
            y: y - 7,
            text: node.key,
            fontSize: 15,
            fill: FONT_COLOR,
            align: 'center',
            width: 40
        }));

        if (this.showHeightInfo) {
            //additional-information: text (prints the height information)
            //decision on which side of the node the information should be displayed
            let xPositionOfNodeInfo = x;
            xPositionOfNodeInfo += (rowIndex % 2) ? 20 : -30;

            //add information to layer
            this.layer.add(new Kinetic.Text({
                x: xPositionOfNodeInfo,
                y: y - BASIC_RADIUS,
                text: node.height,
                fontSize: 15,
                fill: FONT_COLOR,
                align: 'left',
                width: 40
            }));
        }
    }

    /**
     * Prints layer if information regarding the current operation
     *
     * @param operationInfo Info about operation
     * @param rotationInfo Info about last rotation
     * @return Kinetic.Layer
     * */
    printInformation(operationInfo, rotationInfo) {
        //output of information regarding the current operation
        let infoLayer = this.newLayer();

        if (operationInfo) {
            infoLayer.add(new Kinetic.Text({
                x: 10,
                y: 10,
                text: operationInfo,
                fontSize: 30,
                fill: FONT_COLOR,
                align: 'left',
                width: 400
            }));
        }
        if (rotationInfo) {
            infoLayer.add(new Kinetic.Text({
                x: 10,
                y: 40,
                text: rotationInfo,
                fontSize: 15,
                fill: FONT_COLOR,
                align: 'left',
                width: 400
            }));
        }
        return infoLayer;
    }
}