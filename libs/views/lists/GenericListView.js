/**
 * View class for GenericList
 */
class GenericListView {

    /**
     * constructs the GenericListView
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
     * @param {GenericList} model of corresponding GenericList
     */
    draw(model) {
        this._layer.removeChildren();
        this._stageMinHeight = 0;
        this._stageMinWidth = 0;
        let radius = 20;
        let xOffset = radius * 3;
        let fontSize = radius * 1.8;
        let fontSizeOther = 18;
        let showResultMinWidth = 170;

        // region resultText
        if (model.showResultText) {
            let count = new Kinetic.Text({
                x: 5,
                y: 5,
                text: model.resultText,
                fontSize: fontSizeOther,
                fontFamily: 'Calibri',
                fill: model.resultTextColor,
            });
            this._layer.add(count);
        }
        // endregion

        // region elements
        for (let i = 0; i < model.elements.length; i++) {
            // center coords of the circle
            let cx = radius + 5 + i * xOffset;
            let cy = radius + 5;
            if (model.showResultText)
                cy += 25;

            // nodes
            let circle = new Kinetic.Circle({
                x: cx,
                y: cy,
                radius: radius,
                fill: model.elements[i].backGroundColor,
                stroke: model.elements[i].strokeColor,
                strokeWidth: 2
            });
            let text = new Kinetic.Text({
                x: cx - radius * 0.9,
                y: cy - radius * 0.85,
                text: model.elements[i].value,
                fontSize: fontSize,
                fontFamily: 'Calibri',
                fill: model.elements[i].fontColor,
                width: fontSize,
                align: 'center'
            });

            this._layer.add(circle);
            this._layer.add(text);

            // connection arrows between nodes
            if (model.elements.length > 1 && i > 0 && i < model.elements.length) {
                let arrow = kineticArrow(cx + radius - xOffset, cy, cx - radius, cy, 10, 'black', 2);
                this._layer.add(arrow);
            }

            // update minimal width of stage
            if (i === model.elements.length - 1) {
                this._stageMinWidth = cx + radius + 5;
                this._stageMinHeight = cy + radius + 5;
            }
        }
        // endregion

        // minimal stage in case only few or no elements are in the list
        if (model.showResultText && this._stageMinWidth < showResultMinWidth)
            this._stageMinWidth = showResultMinWidth;
        if (model.showResultText && this._stageMinHeight < 30)
            this._stageMinHeight = 30;

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