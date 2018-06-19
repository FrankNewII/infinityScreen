var Config = require('./infinity-screen.config.js'),
    Map = require( './infinity-screen.inertion-state.js' ),
    Overlay = require( './infinity-screen.overlay.js' ),
    InertionState = require ( './infinity-screen.map.js' );



function InfinityScroll(elm, config) {
    if (elm) {
        this.isCatched = false;
        this.config = Object.assign(new Config, config || {});
        this._elm = this._catchElm(elm);
        this._map = new Map(this._elm, this.config);
        this._overlay = new Overlay(this);
        this._inertionState = new InertionState(this);

        this._catchFn = this._catchUnbindedFn();
        this._uncatch = this._uncatchUnbindedFn();
        this._move = this._moveUnbindedFn();

        this._tempMousePosX = undefined;
        this._tempMousePosY = undefined;

        this.initListeners();
    }
}

InfinityScroll.prototype._moveUnbindedFn = function () {
    var self = this;
    return function (e) {
        if (!self.isCatched) return;

        if (self.config.inertia) {
            self._inertionState.updateStartPos(e);
        }

        if (e.type === 'mousemove') {
            self.moveTo(e.clientX - self._tempMousePosX, e.clientY - self._tempMousePosY);
            self._tempMousePosX = e.clientX;
            self._tempMousePosY = e.clientY;
        }

        if (e.type === 'touchmove') {
            self.moveTo(e.touches[0].clientX - self._tempMousePosX, e.touches[0].clientY - self._tempMousePosY);
            self._tempMousePosX = e.touches[0].clientX;
            self._tempMousePosY = e.touches[0].clientY;
        }
    }
};

InfinityScroll.prototype._uncatchUnbindedFn = function () {
    var self = this;
    return function (e) {
        self.isCatched = false;
        self._tempMousePosX = undefined;
        self._tempMousePosY = undefined;

        if (self.config.inertia) {
            self._inertionState.updateImpulses(e);
            self._inertionState.inertionMove();
        }
    }
};

InfinityScroll.prototype.initListeners = function () {
    this._addMouseListeners();
};

InfinityScroll.prototype.moveTo = function (x, y) {
    this.config.axisX && this._map.setPosX(x);
    this.config.axisY && this._map.setPosY(y);
};

InfinityScroll.prototype._catchElm = function (selector) {
    var elm;
    if (selector instanceof HTMLElement) {
        elm = selector;
    } else if (typeof selector === 'string') {
        elm = document.querySelector(selector);
    }

    if (!elm) {
        throw new Error('Wrong type of argument "selector"');
    }

    return elm;
};

InfinityScroll.prototype.destroy = function () {
    this._map.screenElm.removeEventListener('mousedown', this._catchFn);
    this._map.screenElm.removeEventListener('mousemove', this._move);
    this._map.screenElm.removeEventListener('mouseup', this._uncatch);
    this._map.screenElm.removeEventListener('touchstart', this._catchFn);
};

InfinityScroll.prototype._addMouseListeners = function () {
    this._map.screenElm.addEventListener('mousedown', this._catchFn);
    this._map.screenElm.addEventListener('mousemove', this._move);
    this._map.screenElm.addEventListener('mouseup', this._uncatch);
    this._map.screenElm.addEventListener('touchstart', this._catchFn);
};

InfinityScroll.prototype._catchUnbindedFn = function () {
    var self = this;
    return function (e) {
        self.isCatched = true;
        self._inertionState.updateStartPos(e);
        self._inertionState.updateImpulses(e);
    }
};