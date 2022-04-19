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
        
        if (obj.h2 == null || obj.c2h6 == null || obj.ch4 == null || obj.c2h4 == null || obj.c2h2 == null) {
            res.status(500).send("Invalid request.");
            return;
        }
        
        calcOprByValue(parseFloat(obj.h2), parseFloat(obj.c2h6), parseFloat(obj.ch4), parseFloat(obj.c2h4), parseFloat(obj.c2h2));

        res.append("Content-Type", "image/png");
        res.status(200).send(canvas.toDataURL());

        canvas = null;
        ctx = null;
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

const points = [{ x: 397, y: 149 }, { x: 318, y: 346 }, { x: 112, y: 346 }, { x: 44, y: 147 }, { x: 221, y: 27 }, { x: 397, y: 149 }];
  
const segments = [{
        points: [{ x: 61, y: 191 }, { x: 112, y: 347 }, { x: 190, y: 223 }, { x: 214, y: 211 }, { x: 217, y: 198 }, { x: 61, y: 192 }],
        fill: 'rgb(255,153,153)',
        label: { text: 'T1', cx: 130, cy: 250, withLine: false, endX: null, endY: null }
    }, {
        points: [{ x: 61, y: 191 }, { x: 217, y: 198 }, { x: 220, y: 26 }, { x: 44, y: 149 }],
        fill: 'rgb(0,191,255)',
        label: { text: 'S', cx: 140, cy: 150, withLine: false, endX: null, endY: null }
    }, {
        points: [{ x: 220, y: 26 }, { x: 217, y: 198 }, { x: 239, y: 135 }, { x: 365, y: 230 }, { x: 397, y: 149 }, { x: 221, y: 27 }],
        fill: 'rgb(172,236,222)',
        label: { text: 'D1', cx: 270, cy: 110, withLine: false, endX: null, endY: null }
    }, {
        points: [{ x: 214, y: 211 }, { x: 239, y: 135 }, { x: 365, y: 231 }, { x: 320, y: 336 }],
        fill: 'rgb(51,51,153)',
        label: { text: 'D2', cx: 270, cy: 210, withLine: false, endX: null, endY: null }
    }, {
        points: [{ x: 190, y: 223 }, { x: 214, y: 211 }, { x: 320, y: 336 }, { x: 318, y: 346 }, { x: 223, y: 346 }],
        fill: 'rgb(0,0,0)',
        label: { text: 'T3', cx: 250, cy: 310, withLine: false, endX: null, endY: null }
    }, {
        points: [{ x: 112, y: 347 }, { x: 190, y: 223 }, { x: 223, y: 346 }],
        fill: 'rgb(255,204,0)',
        label: { text: 'T2', cx: 175, cy: 300, withLine: false, endX: null, endY: null }
    }, {
        points: [{ x: 210, y: 105 }, { x: 219, y: 105 }, { x: 219, y: 68 }, { x: 210, y: 68 }],
        fill: 'rgb(255,0,0)',
        label: { text: 'PD', cx: 170, cy: 87, withLine: true, endX: 215, endY: 88 }
    }];

// label styles
const labelfontsize = 12;
const labelfontface = 'verdana';
const labelpadding = 3;

// Legend texts
const legendTexts = [
    'PD = Partial Discharge',
    'T1 = Thermal fault < 300 celcius',
    'T2 = Thermal fault 300 < T < 700 celcius',
    'T3 = Thermal fault < 300 celcius',
    'D1 = Thermal fault T > 700 celcius',
    'D2 = Discharge of High Energy',
    'S = Stray gassing of mineral oil'
];

var canvas, ctx;
var cx, cy, centerPoint;

function initCanvas() {
    canvas = createCanvas(500, 500);
    ctx = canvas.getContext("2d");

    //Legends color
    ctx.font = '14px arial black';
    ctx.fillText("Duval's Pentagon DGA", 130, 20, 300);
    //PD
    ctx.fillStyle = 'rgb(255,0,0)';
    ctx.fillRect(50, 370, 20, 10);
    //T1
    ctx.fillStyle = 'rgb(255,153,153)';
    ctx.fillRect(50, 385, 20, 10);
    //T2
    ctx.fillStyle = 'rgb(255,204,0)';
    ctx.fillRect(50, 400, 20, 10);
    //T3
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(50, 415, 20, 10);
    //D1
    ctx.fillStyle = 'rgb(172,236,222)';
    ctx.fillRect(50, 430, 20, 10);
    //D2
    ctx.fillStyle = 'rgb(51,51,153)';
    ctx.fillRect(50, 445, 20, 10);
    //S
    ctx.fillStyle = 'rgb(0,191,255)';
    ctx.fillRect(50, 460, 20, 10);

    ctx.fillStyle = "black";
    ctx.fillText("Diagnosis Result:",100,490,300);

    cx = 0;
    cy = 0;

    for (var i = 0; i < points.length; i++) {
        cx = cx + points[i].x;
        cy = cy + points[i].y;
    }

    cx = cx / points.length;
    cy = cy / points.length;

    centerPoint = {
        x: cy,
        y: cy
    };

    // draw pentagon
    drawPentagon(points);

    // draw colored segments inside pentagon
    for (var i = 0; i < segments.length; i++) {
        drawSegment(segments[i]);
    }
    
    // draw legend
    drawLegend(legendTexts, 75, 370, 15);

    // draw center point
    drawValuePoint();
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
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }

    function boxedLabel(s, fontsize, fontface, padding) {
        var centerX = s.label.cx;
        var centerY = s.label.cy;
        var text = s.label.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'
        ctx.font = fontsize + 'px ' + fontface
        var textwidth = ctx.measureText(text).width;
        var textheight = fontsize * 1.286;
        var leftX = centerX - textwidth / 2 - padding;
        var topY = centerY - textheight / 2 - padding;
    }

    /* draw basic pentagon */
    function drawPentagon(points) {
        ctx.beginPath();

        for (var i = 0; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }

    function drawLegend(texts, x, y, lineHeight) {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'black';
        ctx.font = '12px arial';

        for (var i = 0; i < texts.length; i++) {
            ctx.fillText(texts[i], x, y + i * lineHeight);
        }
    }

    //Function to fetch the value from database and make the calculations according to excel file by ITF
    function calcOprByValue(h2, c2h6, ch4, c2h4, c2h2) {
        initCanvas()

        var xygresult = getXYGraph(h2, c2h6, ch4, c2h4, c2h2);

        //Draw Bottom Point for bottom line
        var color = detectColor(xygresult.x, xygresult.y);

        // original code below
        findAndDisplayColor(color);
        drawValuePoint(xygresult.x, xygresult.y);
    }

    function findAndDisplayColor(color){
        var red, green, blue;
        red = color.r;
        green = color.g;
        blue = color.b;

        var diagResult;

        if (color.r == 255 && color.g == 0 && color.b == 0) {
            diagResult = legendTexts[0];
        } else if (color.r == 255 && color.g == 153 && color.b == 153) {
            diagResult = legendTexts[1];
        } else if (color.r == 255 && color.g == 204 && color.b == 0) {
            diagResult = legendTexts[2];
        } else if (color.r == 0 && color.g == 0 && color.b == 0) {
            diagResult = legendTexts[3];
        } else if (color.r == 172 && color.g == 236 && color.b == 222) {
            diagResult = legendTexts[4];
        } else if (color.r == 51 && color.g == 51 && color.b == 153) {
            diagResult = legendTexts[5];
        } else if (color.r == 0 && color.g == 191 && color.b == 255) {
            diagResult = legendTexts[6];
        } else {
            diagResult = legendTexts[0];
        }

        ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
        ctx.fillRect(250, 480, 25, 12);
        ctx.fillStyle = "black";
        ctx.fillText(diagResult, 280, 480, 300);
    }

    //Detect color of perticular pixel
    function detectColor(x, y){
        data = ctx.getImageData(x, y, 1, 1).data;

        col = {
            r: data[0],
            g: data[1],
            b: data[2]
        };
        
        return col;
    }

    // get radian function
    function degRadian(degrees) {
        var piValue = Math.PI;
        return degrees * (piValue/180);
    }

    // get the excel calculation
    function getXYGraph(h2, c2h6, ch4, c2h4, c2h2) {
        var total = h2 + c2h6 + ch4 + c2h4 + c2h2;
        var h2_norm = 100*(h2 / total);
        var c2h6_norm = 100*(c2h6 / total);
        var ch4_norm = 100*(ch4 / total);
        var c2h4_norm = 100*(c2h4 / total);
        var c2h2_norm = 100*(c2h2 / total);

        var h2_x = 0;
        var h2_y = h2_norm;

        var rad18 = Math.cos(degRadian(18));
        var rad72 = Math.cos(degRadian(72));
        var c2h6_x = -1 * (c2h6_norm * rad18);
        var c2h6_y = 1 * (c2h6_norm * rad72);

        var rad54 = Math.cos(degRadian(54));
        var rad36 = Math.cos(degRadian(36)); 
        var ch4_x = -1 * (ch4_norm * rad54);
        var ch4_y = -1 * (ch4_norm * rad36);

        var c2h4_x = 1 * (c2h4_norm * rad54);
        var c2h4_y = -1 * (c2h4_norm * rad36);

        var c2h2_x = 1 * (c2h2_norm * rad18);
        var c2h2_y = 1 * (c2h2_norm * rad72);

        var W4 = (((h2_x*c2h6_y)-(c2h6_x*h2_y))+((c2h6_x*ch4_y)-(ch4_x*c2h6_y))+((ch4_x*c2h4_y)-(c2h4_x*R4))+((c2h4_x*c2h2_y )-(c2h2_x*c2h4_y))+((c2h2_x*h2_y)-(h2_x*c2h2_y )))/2;

        var M4 = h2_x;
        var N4 = h2_y;
        var O4 = c2h6_x;
        var P4 = c2h6_y;
        var Q4 = ch4_x;
        var R4 = ch4_y;
        var S4 = c2h4_x;
        var T4 = c2h4_y;
        var U4 = c2h2_x;
        var V4 = c2h2_y;

        // copy from excel easier.
        var W4 = (((M4*P4)-(O4*N4))+((O4*R4)-(Q4*P4))+((Q4*T4)-(S4*R4))+((S4*V4)-(U4*T4))+((U4*N4)-(M4*V4)))/2;

        var xGraph = (((M4+O4)*(M4*P4-O4*N4))+((O4+Q4)*(O4*R4-Q4*P4))+((Q4+S4)*(Q4*T4-S4*R4))+((S4+U4)*(S4*V4-U4*T4))+((U4+M4)*(U4*N4-M4*V4)))/(6*W4);

        var yGraph = (((N4+P4)*(M4*P4-O4*N4))+((P4+R4)*(O4*R4-Q4*P4))+((R4+T4)*(Q4*T4-S4*R4))+((T4+V4)*(S4*V4-U4*T4))+((V4+N4)*(U4*N4-M4*V4)))/(6*W4);

        var xFactor = 4.657894737;
        var yFactor = 4.406077348;

        var xCenter = 221;
        var yCenter = 200;

        xyResult = {
            x: xCenter + (xGraph * xFactor),
            y: yCenter - (yGraph * yFactor)
        };

        return xyResult;
    }

    // draw the point based on the calculations from the excel file
    function drawValuePoint(pointX, pointY){
        //to increase smoothing for numbers with decimal part
        var size = 4;
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(pointX, pointY, size, 0 * Math.PI, 2 * Math.PI);
        ctx.fill();
    }
