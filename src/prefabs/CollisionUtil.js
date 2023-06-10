class CollisionUtil {
    constructor() { }
    static hitboxVerticallyAligned(topHitbox, bottomHitbox, margin = 0) {
        if (bottomHitbox.top == topHitbox.bottom) {
            return topHitbox.right > bottomHitbox.left && topHitbox.left < bottomHitbox.right;
        }
        return false;
    }
    static hitboxHorizontallyAligned(leftHitbox, rightHitbox, margin = 0) {
        if (leftHitbox.right == rightHitbox.left) {
            return leftHitbox.bottom > rightHitbox.top && leftHitbox.top < rightHitbox.bottom;
        }
        return false;
    }
    static hitboxesAligned(hitbox1, hitbox2) {
        return CollisionUtil.hitboxVerticallyAligned(hitbox1, hitbox2) ||
            CollisionUtil.hitboxVerticallyAligned(hitbox2, hitbox1) ||
            CollisionUtil.hitboxHorizontallyAligned(hitbox1, hitbox2) ||
            CollisionUtil.hitboxHorizontallyAligned(hitbox2, hitbox1);
    }
}