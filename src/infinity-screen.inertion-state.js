InfinityScroll.InertionState = function (screen) {
    this._impulseX = 0;
    this._impulseY = 0;
    this._screen = screen;
    this._startX = undefined;
    this._startY = undefined;
    this._readyToUpdatePos = true;
};

InfinityScroll.InertionState.prototype.updateImpulses = function (e) {
    var self = this;
    if( this._readyToUpdatePos ) {
        self._readyToUpdatePos = false;
        var moveTime = performance.now() - this._startDragTime;
        var distanceX = e.clientX - this._startX;
        var distanceY = e.clientY - this._startY;
        var speedX = distanceX / moveTime;
        var speedY = distanceY / moveTime;
        var m = 50;

        this._impulseX = speedX * m;
        this._impulseY = speedY * m;
        setTimeout(function () {
            self._readyToUpdatePos = true;
        }, 100);
    }
};

InfinityScroll.InertionState.prototype.updateStartPos = function (e) {
    this._startX = e.clientX;
    this._startY = e.clientY;
    this._startDragTime = performance.now();
};

InfinityScroll.InertionState.prototype.inertionMove = function () {
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