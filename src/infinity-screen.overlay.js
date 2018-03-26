InfinityScroll.Overlay = function (scroll) {
    this._scroll = scroll;
    this.isShowed = false;
    this._elm = document.createElement('div');
    this._tempMousePosX = undefined;
    this._tempMousePosY = undefined;
    this._uncatchFn = this._uncatchUnbindedFn();
    this._move = this._moveUnbindedFn();
    this.init();
};

InfinityScroll.Overlay.prototype.init = function () {
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

InfinityScroll.Overlay.prototype.initListeners = function () {
    var el = this._elm;
    el.addEventListener('mouseup', this._uncatchFn);
    //el.addEventListener('mousemove', this._move);
    //el.addEventListener('touchmove', this._move);
};

InfinityScroll.Overlay.prototype.hide = function () {
    if (this.isShowed) {
        this._elm.style['display'] = 'none';
        document.body.style['user-select'] = null;
        this.isShowed = false;
    }
};

InfinityScroll.Overlay.prototype.show = function () {
    if (!this.isShowed) {
        this._elm.style['display'] = 'block';
        document.body.style['user-select'] = 'none';
        this.isShowed = true;
    }
};

InfinityScroll.Overlay.prototype._uncatchUnbindedFn = function () {
    var self = this;
    return function () {
        self._scroll.isCatched = false;
        self._tempMousePosX = undefined;
        self._tempMousePosY = undefined;
        self.hide();
    }
};

InfinityScroll.Overlay.prototype._moveUnbindedFn = function () {
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