class ScreenTransition {
    constructor(scene) {
        this.scene = scene;
        this.createGraphics();
    }
    get isActive() { return this.graphics.visible; }
    ;
    createGraphics() {
        this.graphics = this.scene.add.graphics({
            lineStyle: { width: 2, color: 0x0 },
            fillStyle: { color: 0x0, alpha: 1 }
        });
        this.graphics.depth = 7;
        this.graphics.clear();
        let left = -20;
        let right = 380;
        let points = [{ x: left, y: 0 }];
        for (let y = 320 / 8; y <= 320; y += 320 / 8) {
            points.push({ x: left + 18, y });
            left -= 20;
            points.push({ x: left, y });
        }
        for (let y = 320; y >= 0; y -= 320 / 8) {
            points.push({ x: right, y });
            right += 20;
            points.push({ x: right + 18, y });
        }
        this.graphics.fillPoints(points);
        this.graphics.x = 0;
    }
    onLevelEnter(onDone, context) {
        this.scene.tweens.add({
            targets: this.graphics,
            props: {
                x: { value: -560, duration: 750, ease: 'Linear' },
            },
            onComplete: () => {
                this.graphics.x = 560;
                this.graphics.setVisible(false);
                onDone.call(context);
            }
        });
    }
    onLevelClose(onDone, context) {
        this.graphics.setVisible(true);
        this.scene.tweens.add({
            targets: this.graphics,
            props: {
                x: { value: 0, duration: 750, ease: 'Linear', delay: 250 },
            },
            onComplete: onDone.bind(context)
        });
    }
}