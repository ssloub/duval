const express = require("express");
const { createCanvas, loadImage } = require("canvas");

const app = express();

app.use(express.json());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Invalid request data");
});

app.post("/", (req, res) => {
    try {
        const obj = req.body;
        
        if (obj.ch4 == null || obj.c2h2 == null || obj.c2h4 == null) {
            res.status(500).send("Invalid request.");
            return;
        }
        
        calcOprByValue(parseFloat(obj.ch4), parseFloat(obj.c2h2), parseFloat(obj.c2h4));

        res.append("Content-Type", "image/png");
        res.status(200).send(canvas.toDataURL());

        canvas = null;
        ctx = null;
        arrowhead = null;
    } catch {
        res.status(500).send("Failed to process the request.");
    }
});

app.listen(3000, () => {
    console.log("App started listening on port 3000...");
});

module.exports = {
    app
};

// ==================================================================================================== //

// https://www.researchgate.net/publication/4345236_A_Software_Implementation_of_the_Duval_Triangle_Method
//To vary the point size of Dot
const pointSize = 4.5;

const v0 = { x: 114, y: 366 };
const v1 = { x: 306, y: 30 };
const v2 = { x: 498, y: 366 };
const triangle = [v0, v1, v2];

// Define all your segments here
const segments = [{
        points: [{ x: 323, y: 180 }, { x: 430, y: 366 }, { x: 217, y: 366 }],
        fill: "rgb(172,236,222)",
        label: { text: "X3", cx: 300, cy: 395, withLine: false, endX: null, endY: null },
    }, {
        points: [{ x: 151, y: 301 }, { x: 187, y: 301 }, { x: 156, y: 354 }, { x: 224, y: 354 }, { x: 217, y: 366 }, { x: 114, y: 366 }],
        fill: "rgb(51,51,153)",
        label: { text: "D1", cx: 165, cy: 395, withLine: false, endX: null, endY: null },
    }, {
        points: [{ x: 306, y: 30 }, { x: 357, y: 120 }, { x: 254, y: 301 }, { x: 151, y: 301 }],
        fill: "rgb(153,0,153)",
        label: { text: "X2", cx: 245, cy: 60, withLine: true, endX: 280, endY: 55 },
    }, {
        points: [{ x: 187, y: 301 }, { x: 254, y: 301 }, { x: 224, y: 354 }, { x: 156, y: 354 }],
        fill: "rgb(255,153,153)",
        label: {},
    }, {
        points: [{ x: 402, y: 199 }, { x: 498, y: 366 }, { x: 430, y: 366 }, { x: 368, y: 258 }],
        fill: "rgb(255,204,0)",
        label: { text: "T3", cx: 480, cy: 270, withLine: true, endX: 450, endY: 270 },
    }, {
        points: [{ x: 357, y: 120 }, { x: 402, y: 199 }, { x: 368, y: 258 }, { x: 323, y: 180 }],
        fill: "rgb(0,0,0)",
        label: { text: "T2", cx: 405, cy: 140, withLine: true, endX: 373, endY: 120 },
    }
];

// label styles
const labelfontsize = 12;
const labelfontface = "verdana";
const labelpadding = 3;

// pre-create a canvas-image of the arrowhead
const arrowheadLength = 10;
const arrowheadWidth = 8;

const legendTexts = [
    "N = Normal operation",
    "T3 = Severe thermal fault T > 300\u00B0C",
    "T2 = Severe thermal fault 300\u00B0C < T < 700\u00B0C",
    "X3 = Thermal fault/increased resistance/severe arcing",
    "D1 = Abnormal arcing",
    "X2 = Abnormal arcing or thermal fault"
];


var canvas, ctx, arrowhead;

//TextFields for Gases:
var ch4x, ch4y, c2h4x, c2h4y, c2h2x, c2h2y;

function initCanvas() {
    canvas = createCanvas(700, 580);
    ctx = canvas.getContext("2d");

    //Legends color
    ctx.font = "14px arial black";
    ctx.fillText("Duval's Triangle DGA", 220, 20, 300);
    //N
    ctx.fillStyle = "rgb(255,153,153)";
    ctx.fillRect(30, 452, 20, 10);
    //T3
    ctx.fillStyle = "rgb(255,204,0)";
    ctx.fillRect(30, 467, 20, 10);
    //T2
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(30, 482, 20, 10);
    //X3
    ctx.fillStyle = "rgb(172,236,222)";
    ctx.fillRect(30, 497, 20, 10);
    //D1
    ctx.fillStyle = "rgb(51,51,153)";
    ctx.fillRect(30, 512, 20, 10);
    //X1
    ctx.fillStyle = "rgb(153,0,153)";
    ctx.fillRect(30, 527, 20, 10);

    ctx.fillStyle = "black";
    ctx.fillText("Diagnosis Result:", 350, 538, 300);

    arrowhead = createCanvas();
    premakeArrowhead();

    // draw colored segments inside triangle
    for (var i = 0; i < segments.length; i++) {
        drawSegment(segments[i]);
    }

    // draw ticklines
    ticklines(v0, v1, 9, 0, 20);
    ticklines(v1, v2, 9, Math.PI * 3 / 4, 20);
    ticklines(v2, v0, 9, Math.PI * 5 / 4, 20);
    // molecules
    moleculeLabel(v0, v1, 100, Math.PI, "% CH4");
    moleculeLabel(v1, v2, 100, 0, "% C2H4");
    moleculeLabel(v2, v0, 75, Math.PI / 2, "% C2H2");
    // draw outer triangle
    drawTriangle(triangle);
    // draw legend
    drawLegend(legendTexts, 55, 450, 15);
}

function drawSegment(s) {
    // draw and fill the segment path
    ctx.beginPath();
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (var i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = s.fill;
    ctx.fill();
    ctx.lineWidth = 0;
    ctx.strokeStyle = "black";
    ctx.stroke();
    // draw segment's box label
    if (s.label.withLine) {
        lineBoxedLabel(s, labelfontsize, labelfontface, labelpadding);
    } else {
        boxedLabel(s, labelfontsize, labelfontface, labelpadding);
    }
}

function moleculeLabel(start, end, offsetLength, angle, text) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "14px verdana";
    var dx = end.x - start.x;
    var dy = end.y - start.y;
    var x0 = parseInt(start.x + dx * 0.50);
    var y0 = parseInt(start.y + dy * 0.50);
    var x1 = parseInt(x0 + offsetLength * Math.cos(angle));
    var y1 = parseInt(y0 + offsetLength * Math.sin(angle));
    ctx.fillStyle = "black";
    ctx.fillText(text, x1, y1);
    // arrow
    x0 = parseInt(start.x + dx * 0.35);
    y0 = parseInt(start.y + dy * 0.35);
    x1 = parseInt(x0 + 50 * Math.cos(angle));
    y1 = parseInt(y0 + 50 * Math.sin(angle));
    var x2 = parseInt(start.x + dx * 0.65);
    var y2 = parseInt(start.y + dy * 0.65);
    var x3 = parseInt(x2 + 50 * Math.cos(angle));
    var y3 = parseInt(y2 + 50 * Math.sin(angle));
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x3, y3);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    angle = Math.atan2(dy, dx);
    ctx.translate(x3, y3);
    ctx.rotate(angle);
    ctx.drawImage(arrowhead, -arrowheadLength, -arrowheadWidth / 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function boxedLabel(s, fontsize, fontface, padding) {
    var centerX = s.label.cx;
    var centerY = s.label.cy;
    var text = s.label.text;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = fontsize + "px " + fontface;
    var textwidth = ctx.measureText(text).width;
    var textheight = fontsize * 1.286;
    var leftX = centerX - textwidth / 2 - padding;
    var topY = centerY - textheight / 2 - padding;
    ctx.fillStyle = "white";
    ctx.fillRect(leftX, topY, textwidth + padding * 2, textheight + padding * 2);
    ctx.lineWidth = 1;
    ctx.strokeRect(leftX, topY, textwidth + padding * 2, textheight + padding * 2);
    ctx.fillStyle = "black";
    ctx.fillText(text, centerX, centerY);
}

function lineBoxedLabel(s, fontsize, fontface, padding) {
    var centerX = s.label.cx;
    var centerY = s.label.cy;
    var text = s.label.text;
    var lineToX = s.label.endX;
    var lineToY = s.label.endY;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = fontsize + "px " + fontface;
    var textwidth = ctx.measureText(text).width;
    var textheight = fontsize * 1.286;
    var leftX = centerX - textwidth / 2 - padding;
    var topY = centerY - textheight / 2 - padding;
    // the line
    ctx.beginPath();
    ctx.moveTo(leftX, topY + textheight / 2);
    ctx.lineTo(lineToX, topY + textheight / 2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    // the boxed text
    ctx.fillStyle = "white";
    ctx.fillRect(leftX, topY, textwidth + padding * 2, textheight + padding * 2);
    ctx.strokeRect(leftX, topY, textwidth + padding * 2, textheight + padding * 2);
    ctx.fillStyle = "black";
    ctx.fillText(text, centerX, centerY);
}

function ticklines(start, end, count, angle, length) {
    var dx = end.x - start.x;
    var dy = end.y - start.y;
    ctx.lineWidth = 1;
    for (var i = 1; i < count; i++) {
        var x0 = parseInt(start.x + dx * i / count);
        var y0 = parseInt(start.y + dy * i / count);
        var x1 = parseInt(x0 + length * Math.cos(angle));
        var y1 = parseInt(y0 + length * Math.sin(angle));
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        if (i == 2 || i == 4 || i == 6 || i == 8) {
            var labelOffset = length * 3 / 4;
            x1 = parseInt(x0 - labelOffset * Math.cos(angle));
            y1 = parseInt(y0 - labelOffset * Math.sin(angle));
            ctx.fillStyle = "black";
            ctx.fillText(parseInt(i * 10), x1, y1);
        }
    }
}

function premakeArrowhead() {
    var actx = arrowhead.getContext("2d");
    arrowhead.width = arrowheadLength;
    arrowhead.height = arrowheadWidth;
    actx.beginPath();
    actx.moveTo(0, 0);
    actx.lineTo(arrowheadLength, arrowheadWidth / 2);
    actx.lineTo(0, arrowheadWidth);
    actx.closePath();
    actx.fillStyle = "black";
    actx.fill();
}

function drawTriangle(t) {
    ctx.beginPath();
    ctx.moveTo(t[0].x, t[0].y);
    ctx.lineTo(t[1].x, t[1].y);
    ctx.lineTo(t[2].x, t[2].y);
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
}

//Function to draw legends
function drawLegend(texts, x, y, lineheight) {
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";
    ctx.font = "14px Verdana";
    for (var i = 0; i < texts.length; i++) {
        ctx.fillText(texts[i], x, y + i * lineheight);
    }
}

//Red Dot function
function drawCoordinates(x, y) {
    ctx.fillStyle = "white"; // Red color
    ctx.beginPath();
    ctx.arc(x, y, pointSize, 0, Math.PI * 2, true);
    ctx.fill();
}

//Function to draw final cords connecting intersection with the % contribution
function drawCords(x, y) {
    ctx.moveTo(x, y);
    ctx.lineTo(ch4x, ch4y);
    ctx.moveTo(x, y);
    ctx.lineTo(c2h4x, c2h4y);
    ctx.moveTo(x, y);
    ctx.lineTo(c2h2x, c2h2y);
    ctx.strokeStyle = "white";
    ctx.stroke();
}

function calcOprByValue(ch4, c2h2, c2h4) {
    initCanvas();

    total = ch4 + c2h2 + c2h4;
    var ch4_contr = (ch4 / total);
    var c2h2_contr = (c2h2 / total);
    var c2h4_contr = (c2h4 / total);
    //Draw Bottom Point for bottom line
    var c2h2_line = BottomCoordinates(c2h2_contr);

    //drawCoordinates(c2h2_line.x, c2h2_line.y);
    //Left Coordinates
    var ch4_line = LeftCoordinates(ch4_contr);
    //drawCoordinates(ch4_line.x, ch4_line.y);
    //Right Coordinates
    var c2h4_line = RightCoordinates(c2h4_contr);
    //drawCoordinates(c2h4_line.x, c2h4_line.y);
    //Updating coordinates values
    ch4x = ch4_line.x;
    ch4y = ch4_line.y;
    c2h4x = c2h4_line.x;
    c2h4y = c2h4_line.y;
    c2h2x = c2h2_line.x;
    c2h2y = c2h2_line.y;
    //2 Reflection Coordinates
    var ref_ch4 = refLeftCoordinates(ch4_contr);
    //drawCoordinates(ref_ch4.x,ref_ch4.y);
    var ref_c2h4 = refRightCoordinates(c2h4_contr);
    //drawCoordinates(ref_c2h4.x,ref_c2h4.y);
    var res = checkLineIntersection(ch4_line.x, ch4_line.y, ref_ch4.x, ref_ch4.y, c2h4_line.x, c2h4_line.y, ref_c2h4.x, ref_c2h4.y);
    var color = detectColor(res.x, res.y);
    findAndDisplayColor(color);
    drawCoordinates(res.x, res.y);
    drawCords(res.x, res.y);
}

function findAndDisplayColor(color) {
    var red,
    green,
    blue;
    red = color.r;
    green = color.g;
    blue = color.b;
    var diagResult;
    if (color.r == 255 && color.g == 153 && color.b == 153) {
        diagResult = "N = Normal operation";
    } else if (color.r == 255 && color.g == 204 && color.b == 0) {
        diagResult = "T3 = Severe thermal fault T > 300\u00B0C";
    } else if (color.r == 0 && color.g == 0 && color.b == 0) {
        diagResult = "T2 = Severe thermal fault 300\u00B0C < T < 700\u00B0C";
    } else if (color.r == 172 && color.g == 236 && color.b == 222) {
        diagResult = "X3 = Thermal fault/increased resistance/severe arcing";
    } else if (color.r == 51 && color.g == 51 && color.b == 153) {
        diagResult = "D1 = Abnormal arcing";
    } else {
        diagResult = "X2 = Abnormal arcing or thermal fault";
    }
    ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
    ctx.fillRect(350, 550, 25, 12);
    ctx.fillStyle = "black";
    ctx.fillText(diagResult, 380, 550, 300);
}

//Detect color of perticular pixel
function detectColor(x, y) {
    data = ctx.getImageData(x, y, 1, 1).data;
    col = {
        r: data[0],
        g: data[1],
        b: data[2]
    };
    return col;
}

function refRightCoordinates(c2h4_contr) {
    var dx = (v2.x - v0.x) * c2h4_contr;
    var coor_x = v0.x + dx;
    var coor_y = v0.y;
    return ({
        x: coor_x,
        y: coor_y
    });
}

function refLeftCoordinates(ch4_contr) {
    var l = Math.sqrt(Math.pow((v2.x - v1.x), 2) + Math.pow((v2.y - v1.y), 2));
    var l_eff = l * ch4_contr;
    var coor_x = v2.x - l_eff * Math.cos(Math.PI / 3);
    var coor_y = v2.y - l_eff * Math.sin(Math.PI / 3);
    return ({
        x: coor_x,
        y: coor_y
    });
}

// Calculating coordinates with three gases value
function LeftCoordinates(ch4_contr) {
    var l = Math.sqrt(Math.pow((v1.x - v0.x), 2) + Math.pow((v1.y - v0.y), 2));
    var l_eff = l * ch4_contr;
    var coor_x = v0.x + l_eff * Math.cos(Math.PI / 3);
    var coor_y = v0.y - l_eff * Math.sin(Math.PI / 3);
    //console.log(coor1_y);
    return ({
        x: coor_x,
        y: coor_y
    });
}

function BottomCoordinates(c2h2_contr) {
    var dx = (v2.x - v0.x) * c2h2_contr;
    var coor_x = v2.x - dx;
    var coor_y = v0.y;
    return ({
        x: coor_x,
        y: coor_y
    });
}

function RightCoordinates(c2h4_contr) {
    var l = Math.sqrt(Math.pow((v1.x - v2.x), 2) + Math.pow((v1.y - v2.y), 2));
    var l_eff = l * c2h4_contr;
    var coor_x = v1.x + l_eff * Math.cos(Math.PI / 3);
    var coor_y = v1.y + l_eff * Math.sin(Math.PI / 3);
    return ({
        x: coor_x,
        y: coor_y
    });
}

//Intesection and get Point
function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator,
    a,
    b,
    numerator1,
    numerator2,
    result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
    /*
    // it is worth noting that this should be the same as:
    x = line2StartX + (b * (line2EndX - line2StartX));
    y = line2StartX + (b * (line2EndY - line2StartY));
     */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
}