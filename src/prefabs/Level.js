class Level {
    constructor(scene, map) {
        this.entities = [];
        this.collidables = [];
        this.map = map;
        this.scene = scene;
        this.collisionManager = new CollisionManager(this);
    }
    update() {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].update();
        }
        for (let i = 0; i < this.collidables.length; i++) {
            this.collisionManager.moveCollidable(this.collidables[i]);
        }
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].lateUpdate();
        }
    }
    addCollidable(collidable) {
        this.collidables.push(collidable);
    }
    addEntity(entity) {
        this.entities.push(entity);
    }
    destroy() {
        this.map.destroy();
        TimeManager.tileAnimations.clear();
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].destroy();
        }
        this.entities.splice(0, this.entities.length);
        this.collidables.splice(0, this.collidables.length);
    }
}