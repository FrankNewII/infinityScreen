InfinityScroll.Map = function (screenElm, configRef) {
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
};

InfinityScroll.Map.prototype.initListeners = function () {
    window.addEventListener('resize', this.resizeFn);
};

InfinityScroll.Map.prototype.updateSizes = function () {
    var sizes = this.screenElm.getBoundingClientRect();
    this.width = sizes.width;
    this.height = sizes.height;
    this.posX = -sizes.width;
    this.posY = -sizes.height;
};

InfinityScroll.Map.prototype.resizeUnbindedFn = function () {
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

InfinityScroll.Map.prototype.setPosX = function (x) {
    if (!isNaN(x) && this.config.axisX) {
        this.posX = this.posX + x;
        this.posX = this.posX < 0 ? this.posX : -this.width;
        this.posX = (0 - this.width * 2 < this.posX) ? this.posX : -this.width;
        this.elm.style['left'] = InfinityScroll.Map.toPx(this.posX);
    }
};

InfinityScroll.Map.prototype.setPosY = function (y) {
    if (!isNaN(y) && this.config.axisY) {
        this.posY = this.posY + y;
        this.posY = this.posY < 0 ? this.posY : -this.height;
        this.posY = (0 - this.height * 2 < this.posY) ? this.posY : -this.height;

        this.elm.style['top'] = InfinityScroll.Map.toPx(this.posY);
    }
};

InfinityScroll.Map.prototype.init = function () {
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

InfinityScroll.Map.prototype.setState = function () {
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

InfinityScroll.Map.toPx = function (px) {
    return px + 'px';
};