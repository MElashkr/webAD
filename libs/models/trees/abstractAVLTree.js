/*jshint esversion: 6*/

/*jslint node: true*/

/**
 * Kind of Interface for AVLTree and ProxyAVLTree
 * */
class AbstractAVLTree {
    /**
     * @abstract
     * */
    constructor(animationSpeed) {
        //initialize animation speed (static variable)
        if (AbstractAVLTree.animationSpeed === null) {
            AbstractAVLTree.animationSpeed = (animationSpeed >= 0 && animationSpeed <= 10) ? animationSpeed : 5;
        }
    }

    /**
     * get animation speed
     * */
    static getAnimationSpeed() {
        return AbstractAVLTree.animationSpeed;
    }

    /**
     * set animation speed
     *
     * @param speed number between 0 and 10
     * */
    static setAnimationSpeed(speed) {
        let success = false;
        if (speed >= 0 && speed <= 10) {
            AbstractAVLTree.animationSpeed = speed;
            success = true;
        }
        return success;
    }

    /**
     * perform next step
     *
     * @abstract
     * */
    resumeOperation() {
    }

    /**
     * pause interval
     *
     * if active stop interval
     * @abstract
     * */
    pauseOperation() {
    }

    /**
     * animation is active
     *
     * @abstract
     * */
    isRunningInterval() {
    }

    /**
     * operation is active
     *
     * different to isRunningInterval, as operation is manual mode is running although no interval is running
     * @abstract
     * */
    isRunningOperation() {
    }

    /**
     * create a new tree
     *
     * @abstract
     * */
    newTree(height) {
    }

    /**
     * insert a key
     *
     * @param key number between -9999 and 9999
     * @abstract
     * */
    insert(key) {
    }

    /**
     * remove a key
     *
     * @param key number
     * @abstract
     * */
    remove(key) {
    }

    /**
     * find a key
     *
     * @param key number
     * @abstract
     * */
    find(key) {
    }

    /**
     * move tape recorder
     *
     * @abstract
     * */
    scrollTape(operation) {
    }

    /**
     * is first position on tape
     *
     * @abstract
     * */
    startOfTape() {
    }

    /**
     * is last position on tape
     *
     * @abstract
     * */
    endOfTape() {
    }
}

AbstractAVLTree.animationSpeed = null;