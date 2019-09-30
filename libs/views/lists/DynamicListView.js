/**
 * View class for DynamicList
 */
class DynamicListView {

    /**
     * constructs the DynamicListView
     * @param {string} container drawing container of the html page
     */
    constructor(container) {
        this._scale = 1;
        this._stageMinWidth = 0;
        this._stageMinHeight = 0;

        this._stage = new Kinetic.Stage({
            container: container,
            draggable: false,
            width: this._stageMinWidth,
            height: this._stageMinHeight,

        });
        this._layer = new Kinetic.Layer({});
        this._stage.add(this._layer);
    }

    /**
     * makes the view objects 10% bigger to a max of 300%
     */
    zoomIn() {
        if (this._scale < 3)
            this._scale += 0.1;
        console.log("scale: " + this._scale);
        this._stage.size({
            width: this._stageMinWidth * this._scale,
            height: this._stageMinHeight * this._scale
        });
        this._stage.scale({x: this._scale, y: this._scale});
        this._stage.draw();
    }

    /**
     * makes the view objects 10% smaller to a min of 50%
     */
    zoomOut() {
        if (this._scale > 0.51)
            this._scale -= 0.1;
        console.log("scale: " + this._scale);
        this._stage.size({
            width: this._stageMinWidth * this._scale,
            height: this._stageMinHeight * this._scale
        });
        this._stage.scale({x: this._scale, y: this._scale});
        this._stage.draw();
    }

    /**
     * removes everything and creates a new image
     * @param {DynamicList} model of corresponding DynamicList
     */
    draw(model) {
        this._layer.removeChildren();
        this._stageMinHeight = 0;
        this._stageMinWidth = 0;
        let valueWidth = 36;
        let nextWidth = 18;
        let height = 40;
        let fontSize = 36;
        let fontSizeTag = 18;
        let fontSizeOther = 18;
        let showResultMinWidth = 170;
        let headTagY = 5;
        let helpTagY = 15 + height + fontSizeTag;
        let helpY = 35 + height + fontSizeTag;
        let helpElementTagY = helpTagY;
        let helpElementY = helpY;
        let help2TagY = helpTagY + height + fontSizeTag + 5;
        let help2Y = helpY + height + fontSizeTag + 5;
        let elementsY = 25;
        let codeSampleY = 80;
        let helpCircleX;
        let helpCircleY;
        let helpElementCircleX;
        let helpElementCircleY;
        let help2CircleX;
        let help2CircleY;

        // region resultText
        if (model.showResultText) {
            let count = new Kinetic.Text({
                x: 5,
                y: 5,
                text: model.resultText,
                fontSize: fontSizeOther,
                fontFamily: 'Calibri',
                fill: model.resultTextColor
            });
            this._layer.add(count);
            headTagY += 20;
            helpTagY += 20;
            helpY += 20;
            elementsY += 20;
            codeSampleY += 20;
            this._stageMinHeight = elementsY + height + 5;
        }
        // endregion

        // region initialize coords of the elements
        let element = model.head;
        let i = 0;
        while (element !== null) {
            // top left corner
            element.xCoord = valueWidth + 30 + i * (valueWidth + nextWidth + 30);
            element.yCoord = elementsY;

            // update minimal width of stage
            if (element.next === null) {
                this._stageMinWidth = element.xCoord + valueWidth + nextWidth + 5;
                this._stageMinHeight = element.yCoord + height + 5;
            }

            i++;
            element = element.next;
        }
        // init coords of the elements after act pointer in addAtNthPosition
        element = model.helpAddNthElementAct;
        while (element !== null) {
            // top left corner
            element.xCoord = valueWidth + 30 + i * (valueWidth + nextWidth + 30);
            element.yCoord = elementsY;
            // update minimal width of stage
            if (element.next === null) {
                this._stageMinWidth = element.xCoord + valueWidth + nextWidth + 5;
                this._stageMinHeight = element.yCoord + height + 5;
            }
            i++;
            element = element.next;
        }
        // endregion

        // region help
        if (model.help !== null) {
            codeSampleY += height + fontSizeTag + 10;
            this._stageMinHeight = helpY + height + 5;

            // move helpElementY
            helpElementTagY = help2TagY;
            helpElementY = help2Y;

            // helpPointer
            let helpTag = new Kinetic.Text({
                x: 5,
                y: helpTagY,
                text: "help",
                fontSize: fontSizeTag,
                fontFamily: 'Calibri',
                fill: 'black'
            });
            let helpRect = new Kinetic.Rect({
                x: 5,
                y: helpY,
                width: valueWidth,
                height: height,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 2
            });
            helpCircleX = 5 + valueWidth / 2;
            helpCircleY = helpY + height / 2;
            let helpCircle = new Kinetic.Circle({
                x: helpCircleX,
                y: helpCircleY,
                radius: 3,
                fill: 'black',
                stroke: 'black',
                strokeWidth: 2
            });
            this._layer.add(helpTag);
            this._layer.add(helpRect);
            this._layer.add(helpCircle);
        }
        // endregion

        // region helpElement, helpAddNthElement
        if (model.helpElement !== null || model.helpAddNthElement !== null) {
            codeSampleY += height + fontSizeTag + 10;
            this._stageMinHeight = helpElementY + height + 5;

            // helpPointer
            let helpTag = new Kinetic.Text({
                x: 5,
                y: helpElementTagY,
                text: "help",
                fontSize: fontSizeTag,
                fontFamily: 'Calibri',
                fill: 'black'
            });
            let helpRect = new Kinetic.Rect({
                x: 5,
                y: helpElementY,
                width: valueWidth,
                height: height,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 2
            });
            helpElementCircleX = 5 + valueWidth / 2;
            helpElementCircleY = helpElementY + height / 2;
            let helpCircle = new Kinetic.Circle({
                x: helpElementCircleX,
                y: helpElementCircleY,
                radius: 3,
                fill: 'black',
                stroke: 'black',
                strokeWidth: 2
            });
            this._layer.add(helpTag);
            this._layer.add(helpRect);
            this._layer.add(helpCircle);
        }
        // endregion

        // region help2
        if (model.help2 !== null) {
            codeSampleY += height + fontSizeTag + 10;
            this._stageMinHeight = help2Y + height + 5;

            // helpPointer
            let helpTag = new Kinetic.Text({
                x: 5,
                y: help2TagY,
                text: "help",
                fontSize: fontSizeTag,
                fontFamily: 'Calibri',
                fill: 'black'
            });
            let helpRect = new Kinetic.Rect({
                x: 5,
                y: help2Y,
                width: valueWidth,
                height: height,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 2
            });
            help2CircleX = 5 + valueWidth / 2;
            help2CircleY = help2Y + height / 2;
            let helpCircle = new Kinetic.Circle({
                x: help2CircleX,
                y: help2CircleY,
                radius: 3,
                fill: 'black',
                stroke: 'black',
                strokeWidth: 2
            });
            this._layer.add(helpTag);
            this._layer.add(helpRect);
            this._layer.add(helpCircle);
        }
        // endregion

        // region helpElement, helpAddNthElement pointer
        if (model.helpElement !== null || model.helpAddNthElement !== null) {
            let tempElement;
            if (model.helpAddNthElement !== null)
                tempElement = model.helpAddNthElement;
            else
                tempElement = model.helpElement;
            // helpElement element
            tempElement.xCoord = valueWidth + 30;
            tempElement.yCoord = helpElementY;
            let valueRect = new Kinetic.Rect({
                x: tempElement.xCoord,
                y: tempElement.yCoord,
                width: valueWidth,
                height: height,
                fill: tempElement.backGroundColor,
                stroke: tempElement.strokeColor,
                strokeWidth: 2
            });
            let nextRect = new Kinetic.Rect({
                x: tempElement.xCoord + valueWidth,
                y: tempElement.yCoord,
                width: nextWidth,
                height: height,
                fill: tempElement.backGroundColor,
                stroke: tempElement.strokeColor,
                strokeWidth: 2
            });
            let text = new Kinetic.Text({
                x: tempElement.xCoord,
                y: tempElement.yCoord + 3,
                text: tempElement.value,
                fontSize: fontSize,
                fontFamily: 'Calibri',
                fill: tempElement.fontColor,
                width: fontSize,
                align: 'center'
            });
            this._layer.add(valueRect);
            this._layer.add(nextRect);
            this._layer.add(text);

            // helpElement pointer to element
            let arrowHelp = kineticArrow(helpElementCircleX, helpElementCircleY, tempElement.xCoord, tempElement.yCoord + height / 2, 10, 'black', 2);
            this._layer.add(arrowHelp);
            // element pointer to next element
            if (tempElement.next !== null && model.helpAddNthElement === null) {
                let x = tempElement.xCoord + valueWidth + nextWidth / 2;
                let y = tempElement.yCoord + height / 2;
                let helpElemCircle = new Kinetic.Circle({
                    x: x,
                    y: y,
                    radius: 3,
                    fill: 'black',
                    stroke: 'black',
                    strokeWidth: 2
                });
                let arrowElement = kineticArrow(x, y, tempElement.next.xCoord + valueWidth / 2, tempElement.next.yCoord + height, 10, 'black', 2);
                this._layer.add(helpElemCircle);
                this._layer.add(arrowElement);
            }
        }
        // endregion

        // region elements
        element = model.head;
        while (element !== null) {
            let valueRect = new Kinetic.Rect({
                x: element.xCoord,
                y: element.yCoord,
                width: valueWidth,
                height: height,
                fill: element.backGroundColor,
                stroke: element.strokeColor,
                strokeWidth: 2
            });
            let nextRect = new Kinetic.Rect({
                x: element.xCoord + valueWidth,
                y: element.yCoord,
                width: nextWidth,
                height: height,
                fill: element.backGroundColor,
                stroke: element.strokeColor,
                strokeWidth: 2
            });
            let text = new Kinetic.Text({
                x: element.xCoord,
                y: element.yCoord + 3,
                text: element.value,
                fontSize: fontSize,
                fontFamily: 'Calibri',
                fill: element.fontColor,
                width: fontSize,
                align: 'center'
            });
            this._layer.add(valueRect);
            this._layer.add(nextRect);
            this._layer.add(text);

            element = element.next;
        }
        // draw the elements after act pointer in addAtNthPosition
        element = model.helpAddNthElementAct;
        while (element !== null) {
            let valueRect = new Kinetic.Rect({
                x: element.xCoord,
                y: element.yCoord,
                width: valueWidth,
                height: height,
                fill: element.backGroundColor,
                stroke: element.strokeColor,
                strokeWidth: 2
            });
            let nextRect = new Kinetic.Rect({
                x: element.xCoord + valueWidth,
                y: element.yCoord,
                width: nextWidth,
                height: height,
                fill: element.backGroundColor,
                stroke: element.strokeColor,
                strokeWidth: 2
            });
            let text = new Kinetic.Text({
                x: element.xCoord,
                y: element.yCoord + 3,
                text: element.value,
                fontSize: fontSize,
                fontFamily: 'Calibri',
                fill: element.fontColor,
                width: fontSize,
                align: 'center'
            });
            this._layer.add(valueRect);
            this._layer.add(nextRect);
            this._layer.add(text);

            element = element.next;
        }
        // endregion

        // region head pointer
        let headTag = new Kinetic.Text({
            x: 5,
            y: headTagY,
            text: "head",
            fontSize: fontSizeTag,
            fontFamily: 'Calibri',
            fill: 'black'
        });
        let headRect = new Kinetic.Rect({
            x: 5,
            y: elementsY,
            width: valueWidth,
            height: height,
            fill: 'transparent',
            stroke: 'black',
            strokeWidth: 2
        });
        this._layer.add(headTag);
        this._layer.add(headRect);
        // head arrow
        if (model.head !== null) { // there are element in the list
            let cx = 5 + valueWidth / 2;
            let cy = elementsY + height / 2;
            let headCircle = new Kinetic.Circle({
                x: cx,
                y: cy,
                radius: 3,
                fill: 'black',
                stroke: 'black',
                strokeWidth: 2
            });
            let arrow = kineticArrow(cx, cy, model.head.xCoord, model.head.yCoord + height / 2, 10, 'black', 2);
            this._layer.add(headCircle);
            this._layer.add(arrow);
        }
        // endregion

        // region element pointer arrows
        element = model.head;
        while (element !== null) {
            // not the last element in the list
            if (element.next !== null) {
                let cx = element.xCoord + valueWidth + nextWidth / 2;
                let cy = element.yCoord + height / 2;
                let elemCircle = new Kinetic.Circle({
                    x: cx,
                    y: cy,
                    radius: 3,
                    fill: 'black',
                    stroke: 'black',
                    strokeWidth: 2
                });
                let arrow = kineticArrow(cx, cy, element.next.xCoord, element.next.yCoord + height / 2, 10, 'black', 2);
                this._layer.add(elemCircle);
                this._layer.add(arrow);
            } else {
                // last element in the list
                let text = new Kinetic.Text({
                    x: element.xCoord + valueWidth,
                    y: element.yCoord + 8,
                    text: '0',
                    fontSize: 26,
                    fontFamily: 'Calibri',
                    fill: 'black',
                    width: nextWidth,
                    align: 'center'
                });
                this._layer.add(text);
            }
            element = element.next;
        }
        // draw the element pointer arrows after act pointer in addAtNthPosition
        element = model.helpAddNthElementAct;
        while (element !== null) {
            // not the last element in the list
            if (element.next !== null) {
                let cx = element.xCoord + valueWidth + nextWidth / 2;
                let cy = element.yCoord + height / 2;
                let elemCircle = new Kinetic.Circle({
                    x: cx,
                    y: cy,
                    radius: 3,
                    fill: 'black',
                    stroke: 'black',
                    strokeWidth: 2
                });
                let arrow = kineticArrow(cx, cy, element.next.xCoord, element.next.yCoord + height / 2, 10, 'black', 2);
                this._layer.add(elemCircle);
                this._layer.add(arrow);
            } else {
                // last element in the list
                let text = new Kinetic.Text({
                    x: element.xCoord + valueWidth,
                    y: element.yCoord + 8,
                    text: '0',
                    fontSize: 26,
                    fontFamily: 'Calibri',
                    fill: 'black',
                    width: nextWidth,
                    align: 'center'
                });
                this._layer.add(text);
            }
            element = element.next;
        }
        // endregion

        // region help pointer
        if (model.help !== null) {
            // help pointer to element
            let arrowHelp = kineticArrow(helpCircleX, helpCircleY, model.help.xCoord + valueWidth / 2, model.help.yCoord + height, 10, 'black', 2);
            this._layer.add(arrowHelp);
        }
        if (model.help2 !== null) {
            // help2 pointer to element
            let arrowHelp = kineticArrow(help2CircleX, help2CircleY, model.help2.xCoord + valueWidth / 2, model.help2.yCoord + height, 10, 'black', 2);
            this._layer.add(arrowHelp);
        }
        // endregion

        // region operationCode
        if (model.showOperationCode) {
            let x = 5;
            let y = codeSampleY;
            let textMaxWidth = 0;
            for (let i = 0; i < model.operationCode.length; i++) {
                // top left corner of line
                if (i > 0)
                    y += model.operationCode[i - 1].fontSize;

                let text = new Kinetic.Text({
                    x: x,
                    y: y,
                    text: model.operationCode[i].code,
                    fontSize: model.operationCode[i].fontSize,
                    fontFamily: 'Courier New',
                    fill: 'black'
                });
                if (model.operationCode[i].highlighted)
                    text.fontStyle('bold');

                this._layer.add(text);

                // update maximum width of code line
                if (text.textWidth > textMaxWidth)
                    textMaxWidth = text.textWidth;

                // update minimal height and width of stage
                if (i === model.operationCode.length - 1) {
                    if (this._stageMinWidth < textMaxWidth)
                        this._stageMinWidth = textMaxWidth + 5;
                    this._stageMinHeight = y + model.operationCode[i].fontSize + 5;
                }
            }
        }
        // endregion

        // minimal stage in case only few or no elements are in the list
        if (model.showResultText && this._stageMinWidth < showResultMinWidth)
            this._stageMinWidth = showResultMinWidth;
        else if (this._stageMinWidth < 135)
            this._stageMinWidth = 135;
        if (this._stageMinHeight < 70)
            this._stageMinHeight = 70;

        this._stage.size({
            width: this._stageMinWidth * this._scale,
            height: this._stageMinHeight * this._scale
        });
        this._stage.draw();
    }
}

/**
 * Creates an arrow based on Kinetic.Line
 * Calculations are based on an example which is located here:
 * https://jharaphula.com/how-to-draw-arrow-head-line-using-kineticjs/
 * Last accessed 23.04.2019.
 * All credits go to mentioned website!
 * @param startX x-coordinate of the starting point
 * @param startY y-coordinate of the starting point
 * @param endX x-coordinate of the arrow tip
 * @param endY y-coordinate of the arrow tip
 * @param headSize length of the arrow head
 * @param strokeColor color of the arrow
 * @param strokeWidth stroke width
 * @return {Kinetic.Line}
 */
function kineticArrow(startX, startY, endX, endY, headSize, strokeColor, strokeWidth) {
    let angle = Math.atan2(endY - startY, endX - startX);
    return new Kinetic.Line({
        points: [startX, startY,
            endX,
            endY,
            endX - headSize * Math.cos(angle - Math.PI / 6),
            endY - headSize * Math.sin(angle - Math.PI / 6),
            endX,
            endY,
            endX - headSize * Math.cos(angle + Math.PI / 6),
            endY - headSize * Math.sin(angle + Math.PI / 6)
        ],
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        lineCap: 'round',
        lineJoin: 'round',
    });
}