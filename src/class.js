class Star {
    constructor(ctx, starRadius) {
        this._x = Math.random() * ctx.canvas.width;
        this._y = Math.random() * (ctx.canvas.height / 2.7);
        this._radius = Math.random() * starRadius;
    }

    get x() { return this._x }
    get y() { return this._y }
    get radius() { return this._radius }
}

export { Star };