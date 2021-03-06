(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./infinity-screen.config.js":2,"./infinity-screen.inertion-state.js":3,"./infinity-screen.map.js":4,"./infinity-screen.overlay.js":5}],2:[function(require,module,exports){
function Config () {
    this.triggerMenuAttributeSelector = 'data-infinity-scroll';
    this.inertia = true;
    this.axisX = true;
    this.axisY = true;
};

module.exports = Config;
},{}],3:[function(require,module,exports){
function InertionState (screen) {
    this._impulseX = 0;
    this._impulseY = 0;
    this._screen = screen;
    this._startX = undefined;
    this._startY = undefined;
    this._readyToUpdatePos = true;
}

InertionState.prototype.updateImpulses = function (e) {

        self._readyToUpdatePos = false;
        var moveTime = performance.now() - this._startDragTime;
        var distanceX = e.clientX - this._startX;
        var distanceY = e.clientY - this._startY;
        var speedX = distanceX / moveTime;
        var speedY = distanceY / moveTime;
        var m = 50;

        this._impulseX = speedX * m;
        this._impulseY = speedY * m;
};

InertionState.prototype.updateStartPos = function (e) {
    var self = this;
    if( this._readyToUpdatePos ) {
        self._readyToUpdatePos = false;
        this._startX = e.clientX;
        this._startY = e.clientY;
        this._startDragTime = performance.now();
        setTimeout(function () {
            self._readyToUpdatePos = true;
        }, 100);
    }
};

InertionState.prototype.inertionMove = function () {
    if (!this._screen.isCatched) {
        var self = this;

        var tmpImpX = this._impulseX - (this._impulseX / 40);
        var tmpImpY = this._impulseY - (this._impulseY / 40);

        if (Math.abs(this._impulseX - tmpImpY) > .1 && Math.abs(this._impulseY - tmpImpX) > .1) {
            setTimeout(function () {
                self._screen.moveTo(tmpImpX, tmpImpY);

                self._impulseX = tmpImpX;
                self._impulseY = tmpImpY;

                self.inertionMove(tmpImpX, tmpImpY);
            }, 16);
        }
    }
};

module.exports = InertionState;
},{}],4:[function(require,module,exports){
function Map (screenElm, configRef) {
    this.width = undefined;
    this.height = undefined;
    this.posX = undefined;
    this.posY = undefined;
    this.elm = undefined;
    this._copies = [];
    this.config = configRef;
    this.screenElm = screenElm;
    this.resizeFn = this.resizeUnbindedFn();

    this.updateSizes();
    this.init();
}

Map.prototype.initListeners = function () {
    window.addEventListener('resize', this.resizeFn);
};

Map.prototype.updateSizes = function () {
    var sizes = this.screenElm.getBoundingClientRect();
    this.width = sizes.width;
    this.height = sizes.height;
    this.posX = -sizes.width;
    this.posY = -sizes.height;
};

Map.prototype.resizeUnbindedFn = function () {
    var self = this;
    var toPx = InfinityScroll.Map.toPx;
    var isChanged = false;

    return function (e) {
        if (!isChanged) {
            isChanged = true;
            setTimeout(function () {
                isChanged = false;
                self.updateSizes();
                self.setState();
                self._copies
                    .forEach(function (copy) {
                        copy.style['width'] = toPx(self.width);
                        copy.style['height'] = toPx(self.height);
                    });
            }, 100);
        }
    }
};

Map.prototype.setPosX = function (x) {
    if (!isNaN(x) && this.config.axisX) {
        this.posX = this.posX + x;
        this.posX = this.posX < 0 ? this.posX : -this.width;
        this.posX = (0 - this.width * 2 < this.posX) ? this.posX : -this.width;
        this.elm.style['left'] = InfinityScroll.Map.toPx(this.posX);
    }
};

Map.prototype.setPosY = function (y) {
    if (!isNaN(y) && this.config.axisY) {
        this.posY = this.posY + y;
        this.posY = this.posY < 0 ? this.posY : -this.height;
        this.posY = (0 - this.height * 2 < this.posY) ? this.posY : -this.height;

        this.elm.style['top'] = InfinityScroll.Map.toPx(this.posY);
    }
};

Map.prototype.init = function () {
    var toPx = InfinityScroll.Map.toPx;
    var necessaryCopies = 1;
    if (this.config.axisX) {
        necessaryCopies *= 3;
    }
    if (this.config.axisY) {
        necessaryCopies *= 3;
    }
    this.elm = document.createElement('div');
    this.elm.classList.add('map');
    this.elm.style['user-select'] = 'none';

    for (var i = 0; i < necessaryCopies; i++) {
        var copy = this.screenElm.cloneNode(true);
        copy.style['float'] = 'left';
        copy.style['width'] = toPx(this.width);
        copy.style['height'] = toPx(this.height);
        this.elm.appendChild(copy);
        this._copies.push(copy);
    }

    this.screenElm.innerHTML = "";
    this.screenElm.style['position'] = 'relative';
    this.screenElm.style['overflow'] = 'hidden';
    this.elm.style['position'] = 'absolute';
    this.setState();
    this.initListeners();
    this.screenElm.appendChild(this.elm);
};

Map.prototype.setState = function () {
    var toPx = InfinityScroll.Map.toPx;
    if (this.config.axisY) {
        this.elm.style['height'] = toPx(this.height * (this.config.axisY ? 3 : 1));
        this.elm.style['top'] = toPx(this.posY);
    }
    if (this.config.axisX) {
        this.elm.style['width'] = toPx(this.width * (this.config.axisX ? 3 : 1));
        this.elm.style['left'] = toPx(this.posX);
    }
};

Map.toPx = function (px) {
    return px + 'px';
};

module.exports = Map;
},{}],5:[function(require,module,exports){
Overlay = function (scroll) {
    this._scroll = scroll;
    this.isShowed = false;
    this._elm = document.createElement('div');
    this._tempMousePosX = undefined;
    this._tempMousePosY = undefined;
    this._uncatchFn = this._uncatchUnbindedFn();
    this._move = this._moveUnbindedFn();
    this.init();
};

Overlay.prototype.init = function () {
    var el = this._elm;
    el.style['position'] = 'fixed';
    el.style['z-index'] = 10000;
    el.style['display'] = 'none';
    el.style['height'] = '100%';
    el.style['width'] = '100%';
    el.style['top'] = '0';
    el.style['left'] = '0';
    el.style['cursor'] = 'move';
    this.initListeners();
    document.body.appendChild(el);
};

Overlay.prototype.initListeners = function () {
    var el = this._elm;
    el.addEventListener('mouseup', this._uncatchFn);
    //el.addEventListener('mousemove', this._move);
    //el.addEventListener('touchmove', this._move);
};

Overlay.prototype.hide = function () {
    if (this.isShowed) {
        this._elm.style['display'] = 'none';
        document.body.style['user-select'] = null;
        this.isShowed = false;
    }
};

Overlay.prototype.show = function () {
    if (!this.isShowed) {
        this._elm.style['display'] = 'block';
        document.body.style['user-select'] = 'none';
        this.isShowed = true;
    }
};

Overlay.prototype._uncatchUnbindedFn = function () {
    var self = this;
    return function () {
        self._scroll.isCatched = false;
        self._tempMousePosX = undefined;
        self._tempMousePosY = undefined;
        self.hide();
    }
};

Overlay.prototype._moveUnbindedFn = function () {
    var self = this;
    return function (e) {
        if (self.isShowed) {
            if (e.type === 'mousemove') {
                self._scroll.moveTo(e.clientX - self._tempMousePosX, e.clientY - self._tempMousePosY);
                self._tempMousePosX = e.clientX;
                self._tempMousePosY = e.clientY;
            }
            if (e.type === 'touchmove') {
                self._scroll.moveTo(e.touches[0].clientX - self._tempMousePosX, e.touches[0].clientY - self._tempMousePosY);
                self._tempMousePosX = e.touches[0].clientX;
                self._tempMousePosY = e.touches[0].clientY;
            }
        }
    }
};

module.exports = Overlay;
},{}]},{},[1])