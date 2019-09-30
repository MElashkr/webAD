/**
 * View class for StaticList
 */
class StaticListView {

    /**
     * constructs the StaticListView
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
     * @param {StaticList} model of corresponding StaticList
     */
    draw(model) {
        this._layer.removeChildren();
        this._stageMinHeight = 0;
        this._stageMinWidth = 0;
        let width = 36;
        let height = 40;
        let fontSize = 36;
        let fontSizeOther = 18;
        let showResultMinWidth = 300;

        // region maxlength
        let maxLength = new Kinetic.Text({
            x: 5,
            y: 5,
            text: "maxLength: " + model.maxLength,
            fontSize: fontSizeOther,
            fontFamily: 'Calibri',
            fill: 'black',
            width: 130,
            align: 'left'
        });
        this._layer.add(maxLength);
        // endregion

        // region resultText
        if (model.showResultText) {
            let count = new Kinetic.Text({
                x: 135,
                y: 5,
                text: model.resultText,
                fontSize: fontSizeOther,
                fontFamily: 'Calibri',
                fill: model.resultTextColor
            });
            this._layer.add(count);
        }
        // endregion

        // region elements
        // switched to backwards loop, so that the left line of leftmost gray
        // rectangle doesn't overlap the right line of the rightmost black rectangle
        for (let i = model.maxLength - 1; i >= 0; i--) {
            // top left corner
            let x = 5 + i * width;
            let y = 30;

            // empty space of StaticList is drawn in grey
            let tempBackGroundColor = 'transparent';
            let tempStrokeColor = 'grey';
            if (i < model.length) {
                tempBackGroundColor = model.elements[i].backGroundColor;
                tempStrokeColor = model.elements[i].strokeColor;
            }

            let rect = new Kinetic.Rect({
                x: x,
                y: y,
                width: width,
                height: height,
                fill: tempBackGroundColor,
                stroke: tempStrokeColor,
                strokeWidth: 2
            });
            this._layer.add(rect);

            // text only needed on actual elements in the StaticList
            if (i < model.length) {
                let text = new Kinetic.Text({
                    x: x,
                    y: y + 3,
                    text: model.elements[i].value,
                    fontSize: fontSize,
                    fontFamily: 'Calibri',
                    fill: model.elements[i].fontColor,
                    width: fontSize,
                    align: 'center'
                });
                this._layer.add(text);
            }

            // update minimal width of stage
            if (i === model.maxLength - 1) {
                this._stageMinWidth = x + width + 5;
                this._stageMinHeight = y + height + 5;
            }
        }
        // endregion

        // region operationCode
        if (model.showOperationCode) {
            let x = 5;
            let y = 80;
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
        if (this._stageMinHeight < 30)
            this._stageMinHeight = 30;

        this._stage.size({
            width: this._stageMinWidth * this._scale,
            height: this._stageMinHeight * this._scale
        });
        this._stage.draw();
    }
}