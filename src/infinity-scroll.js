function InfinityScroll(elm, config) {
    if (elm) {
        this.isCatched = false;
        this.config = Object.assign(new InfinityScroll.Config, config || {});
        this._elm = this._catchElm(elm);
        this._map = new InfinityScroll.Map(this._elm, this.config);
        this._overlay = new InfinityScroll.Overlay(this);

        this._catchFn = this._catchUnbindedFn();
        this._uncatch = this._uncatchUnbindedFn();
        this._move = this._moveUnbindedFn();

        this._tempMousePosX = undefined;
        this._tempMousePosY = undefined;

        //Inertia
        this._startX = undefined;
        this._startY = undefined;
        this._startDragTime = undefined;

        this.initListeners();
    }
}

InfinityScroll.prototype._moveUnbindedFn = function () {
    var self = this;
    return function (e) {
        if (self.isCatched) {
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
    }
};

InfinityScroll.prototype.inertion = function (impX, impY) {
    if (!this.isCatched) {
        var self = this;

        var tmpImpX = impX - (impX / 40);
        var tmpImpY = impY - (impY / 40);

        if( Math.abs( impX - tmpImpY ) > .1 && Math.abs( impY - tmpImpX ) > .1 ) {
            setTimeout(function () {
                self.moveTo(tmpImpX, tmpImpY);
                self.inertion(tmpImpX, tmpImpY);
            }, 16);
        }
    }
};

InfinityScroll.prototype._uncatchUnbindedFn = function () {
    var self = this;
    return function (e) {
        self.isCatched = false;
        self._tempMousePosX = undefined;
        self._tempMousePosY = undefined;

        if ( self.config.inertia ) {
            var moveTime = performance.now() - self._startDragTime;
            var distanceX = e.clientX - self._startX;
            var distanceY = e.clientY - self._startY;
            var speedX = distanceX / moveTime;
            var speedY = distanceY / moveTime;
            var m = 50;

            var impX = speedX * m;
            var impY = speedY * m;

            self.inertion(impX, impY);
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
        self._startX = e.clientX;
        self._startY = e.clientY;
        self._startDragTime = performance.now();
    }
};