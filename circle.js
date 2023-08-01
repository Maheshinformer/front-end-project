/**
 * this class is for control the circle and it's animating
 */
class Circle {

    /**
     * this get entrance position and radius and gradient detail
     * and generate the circle details
     *
     * @param entrance
     * @param radius
     * @param gradientColors
     */
    constructor(entrance, radius, gradientColors) {
        this._entrance = entrance;
        this._gradientColors = gradientColors;
        this._radius = radius;

        // we need to keep original radius as const
        this._originalRadius = radius;

        // to control the decrease rate of size and position
        this._perspectiveRate = 0.1;

        // initialize the xy
        this.coordinateXY();

        // initialize the variables of x, y and radius
        this.generatePositionVars();
    }

    /**
     * initialize x and y according to size of the canvas
     */
    coordinateXY() {
        switch (this._entrance) {
            case "bottomRight":
                this.x = rndNum(canvas.width * 1.1, canvas.width);
                this.y = rndNum(canvas.height * 1.2, canvas.height * 1.1);
                break;

            case "bottomCenter":
                this.x = rndNum(canvas.width / 1.5, canvas.width / 3);
                this.y = rndNum(canvas.height * 1.3, canvas.height * 1.2);
                break;

            case "bottomLeft":
                this.x = rndNum(canvas.width * -.01, canvas.width * -.02);
                this.y = rndNum(canvas.height * 1.3, canvas.height * 1.2);
                break;
        }

    };

    /**
     * initialize the variables of x, y and radius according to
     * the entrance position
     */
    generatePositionVars() {
        this.positionVars = {
            bottomRight: {
                varY: rndNum(5, 2.5),
                varX: rndNum(4, 1.5),
                varR: rndNum(this._radius * .007, this._radius * .003)
            },
            bottomCenter: {
                varY: rndNum(7, 4.5),
                varX: rndNum(.5, -.5),
                varR: rndNum(this._radius * .007, this._radius * .003)
            },
            bottomLeft: {
                varY: rndNum(5, 2.5),
                varX: rndNum(-3, -6),
                varR: rndNum(this._radius * .007, this._radius * .003)
            },
        }
    };

    /**
     * check if the circle is out of view or not
     * this is different for each entrance
     *
     * @returns {boolean}
     */
    isOutOfView() {
        switch (this._entrance) {
            case "bottomRight":
                return this.x + this._radius < 0 || this.y + this._radius < 0;

            case "bottomCenter":
                return this.y + this._radius < 0 || (this._radius < 0 && this.x > canvas.width);

            case "bottomLeft":
                return this.x + this._radius * 2 < 0 || this.y + (this._radius * 2) < 0;
        }

    };

    /**
     * generate the fill gradient of circle according
     * to the took gradient details
     *
     * @returns {CanvasGradient}
     */
    generateGradient() {

        let circleFill = ctx.createRadialGradient(
            this.x, this.y, this._radius / 2,
            this.x, this.y, this._radius);

        // loop over gradient details to add color stop
        // each item of this._gradientColors contains an offset and a color
        for (let [offset, color] of this._gradientColors) {
            circleFill.addColorStop(offset, color);
        }

        return circleFill;
    };

    /**
     * method to draw a circle on canvas with data obtained
     */
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this._radius, 0, Math.PI * 2, false);

        ctx.strokeStyle = "transparent";
        ctx.fillStyle = this.generateGradient();
        ctx.fill();
        ctx.stroke();
    };

    /**
     * calculate the change rate by percent of topOffset and perspective rate
     *
     * @param topOffset
     * @param rate
     * @returns {number}
     */
    calcChangeRate(topOffset, rate) {
        if (topOffset === 100) return 1;
        return (((topOffset - 100) / 10) * rate) + 1
    }

    /**
     * update the x, y and the radius of the circle,
     * and call draw method to re-draw it
     */
    animate() {

        // to have easy access, put entrance vars in variables
        const varY = this.positionVars[this._entrance].varY;
        const varX = this.positionVars[this._entrance].varX;
        const varR = this.positionVars[this._entrance].varR;

        // calculate the offsetTop percent of circle position
        let topOffset = 100;
        if (canvas.height - this.y + this._radius > 0) {
            topOffset = this.y * 100 / canvas.height;
        }

        // calculate the change rate for the offset
        const changeRate = this.calcChangeRate(topOffset, this._perspectiveRate);

        // update the x and y
        this.x -= Math.max(varX * changeRate, varX * .3);
        this.y -= Math.max(varY * changeRate, varY * .4);

        // update the radius
        if (topOffset > 50 && this._radius > this._originalRadius * .3) {
            this._radius -= Math.max(varR * changeRate, varR * rndNum(.5, .2));
        } else {
            this._radius -= Math.min(varR * changeRate, varR * rndNum(.2, .15))
        }

        // reset the position and the radius if the circle has gone from view
        if (this.isOutOfView() || this._radius < 1) {
            this.coordinateXY();
            this._radius = this._originalRadius;
        }

        // re-draw the circle with updated properties
        this.draw();
    };

}// first of all, I detect my canvas and set the width
// and height of it as large as the screen.
let canvas = document.getElementById("canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

// then I get and save the context of my canvas as **ctx** also,
const ctx = canvas.getContext("2d");

// in order to have easy access to the min/max of the canvas sides
// in the future, I take them and put in the variables
let canvasMin = Math.min(canvas.width, canvas.height);
let canvasMax = Math.max(canvas.width, canvas.height);

// number of circles that should add to canvas
const numberOfCircles = 60;

// to have animated canvas with circles, we need to create circles and keep them.
let circles = [];

// to prevent scaling in canvas we should listen for resize
// of window and update the size of canvas
window.addEventListener("resize", onResize);

/**
 * update the width and height of the canvas on resize
 */
function onResize() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    canvasMin = Math.min(canvas.width, canvas.height);
    canvasMax = Math.max(canvas.width, canvas.height);
}

/**
 * this method is used for generating random numbers between min and max
 * @param max
 * @param min
 * @param floor
 * @returns {number}
 */
function rndNum(max, min = 0, floor = false) {
    if (floor)
        return Math.floor(Math.random() * (max - min) + min);

    return Math.random() * (max - min) + min;
}

/**
 * this function will draw the entire background of canvas.
 */
function drawBackground() {

    // first clear the the whole canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // this will generate the main gradient (main-light) of wallpaper
    let mainGrd = ctx.createRadialGradient(
        canvas.width / 2, rndNum(-85, -100), 1,
        canvas.width / 2, canvasMax / 4, canvasMin * 1.8);
    mainGrd.addColorStop(.4, "#082e96");
    mainGrd.addColorStop(0, "#b32ea3");

    // after creating the gradient and set it colors,
    // we should set it as the fillStyle of the context and
    // paint whole canvas
    ctx.fillStyle = mainGrd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * this method is a util to generate a random circle
 * and push it to the circles array to keep
 */
function addNewCircle() {

    // circles can expose in 3 position,
    // bottom-left corner, bottom-right corner and bottom center.
    const entrances = ["bottomRight", "bottomCenter", "bottomLeft"];
    // I take one of entrances randomly as target entrance
    const targetEntrance = entrances[rndNum(entrances.length, 0, true)];

    // we have 5 different gradient to give each
    // circle a different appearance. each item
    // in below array has colors and offset of gradient.
    const possibleGradients = [
        [
            [0, "rgba(238,31,148,0.14)"],
            [1, "rgba(238,31,148,0)"]
        ],
        [
            [0, "rgba(213,136,1,.2)"],
            [1, "rgba(213,136,1,0)"]
        ],
        [
            [.5, "rgba(213,136,1,.2)"],
            [1, "rgba(213,136,1,0)"]
        ],
        [
            [.7, "rgba(255,254,255,0.07)"],
            [1, "rgba(255,254,255,0)"]
        ],
        [
            [.8, "rgba(255,254,255,0.05)"],
            [.9, "rgba(255,254,255,0)"]
        ]
    ];
    // I take one of gradients details as target gradient details
    const targetGrd = possibleGradients[rndNum(possibleGradients.length, 0, true)];

    // each circle should have a radius. and it will be
    // a random number between three and four quarters of canvas-min side
    const radius = rndNum(canvasMin / 3, canvasMin / 4);

    // this will push the created Circle to the circles array
    circles.push(new Circle(targetEntrance, radius, targetGrd))
}

// to add circles randomly I use an interval that fire every 300ms and a timeout in it.
// every 300ms it will call a timeout func with a delay between 700 and 2000ms, and when
// the timeout callback fired, it will call the addNewCircle method
let addingInterval = setInterval(() => {

    // after adding as manny as expected circles,
    // we clear the interval to stop adding
    if (circles.length > numberOfCircles)
        clearInterval(addingInterval);

    setTimeout(() => {
        addNewCircle();
    }, rndNum(700, 2000));

}, 300);

/**
 * to animate wallpaper, we need to call draw functions frequently.
 * to do that, we use the requestAnimationFrame method that is a browser API.
 * the requestAnimationFrame method get the animateMyWallpaper as the callback
 * function and call it frequently.
 * actually we made a recursion that call draw function on each call.
 *
 * You can read more about [recursion here](https://en.wikipedia.org/wiki/Recursion_(computer_science))
 */
function animateMyWallpaper() {

    // requestAnimationFrame() is a JavaScript method for creating smoother,
    // less resource intensive JavaScript animations
    // you can read mote [here](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
    requestAnimationFrame(animateMyWallpaper);

    // call background draw function.
    drawBackground();

    // loop over circles and call animate function of it
    for (let i = 0; i < circles.length; i++) {
        circles[i].animate();
    }
}


// this just starts animations
animateMyWallpaper();