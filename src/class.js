class Star {
    constructor(ctx, starRadius) {
        this.x = Math.random() * ctx.canvas.width;
        this.y = Math.random() * (ctx.canvas.height / 2);
        this.radius = Math.random() * starRadius;
    }
}

export { Star };