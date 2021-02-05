const stickSize = 6;
const stickBorderSize = 3;
const dangerDistance = 20;
const styleMapping = {
  y: {
    t: 'top',
    m: 'marginTop',
    b: 'bottom',
  },
  x: {
    l: 'left',
    m: 'marginLeft',
    r: 'right',
  },
};

export default {
  name: 'vue-drag-resize',
  props: {
    sticky: {
      type: Boolean,
      default: false,
    },
    xLines: {
      type: Array,
      default() {
        return [];
      },
    },
    yLines: {
      type: Array,
      default() {
        return [];
      },
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isDraggable: {
      type: Boolean,
      default: true,
    },
    isResizable: {
      type: Boolean,
      default: true,
    },
    w: {
      type: Number,
      default: 100,
      validator: val => val >= 0,
    },
    h: {
      type: Number,
      default: 100,
      validator: val => val >= 0,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    z: {
      type: [String, Number],
      default: 'auto',
      validator: val => (typeof val === 'string' ? val === 'auto' : true),
    },
    zoom: {
      type: Number,
      default: 1,
    },
  },

  data: function () {
    return {
      axis: 'both',
      sticks: ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'],
      inDrag: false,
      rawWidth: this.w,
      rawHeight: this.h,
      rawLeft: this.x,
      rawTop: this.y,
      rawRight: null,
      rawBottom: null,
      zIndex: this.z,
      parentWidth: null,
      parentHeight: null,
      top: this.y,
      right: null,
      bottom: null,
      minWidth: this.minw,
      minHeight: this.minh,
      delta: {
        x: 0,
        y: 0,
      },
    };
  },

  created: function () {
    this.stickDrag = false;
    this.bodyDrag = false;
    this.stickAxis = null;
    this.stickStartPos = { mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0 };
    this.limits = {
      minLeft: null,
      maxLeft: null,
      minRight: null,
      maxRight: null,
      minTop: null,
      maxTop: null,
      minBottom: null,
      maxBottom: null,
    };

    this.currentStick = [];
  },

  mounted: function () {
    this.parentElement = this.$el.parentNode;
    this.parentWidth = this.parentElement.clientWidth;

    this.parentHeight = this.parentElement.clientHeight;

    this.rawRight = this.parentWidth - this.rawWidth - this.rawLeft;
    this.rawBottom = this.parentHeight - this.rawHeight - this.rawTop;
    this.parentElement.addEventListener('mousemove', this.move);
    this.parentElement.addEventListener('mouseup', this.up);
    this.parentElement.addEventListener('mouseleave', this.up);
    this.parentElement.addEventListener('mousedown', this.deselect);

    this.parentElement.addEventListener('touchmove', this.move, true);
    this.parentElement.addEventListener('touchend touchcancel', this.up, true);
    this.parentElement.addEventListener('touchstart', this.up, true);
  },

  beforeDestroy: function () {
    this.parentElement.removeEventListener('mousemove', this.move);
    this.parentElement.removeEventListener('mouseup', this.up);
    this.parentElement.removeEventListener('mouseleave', this.up);

    this.parentElement.removeEventListener('mousedown', this.deselect);

    this.parentElement.removeEventListener('touchmove', this.move, true);
    this.parentElement.removeEventListener(
      'touchend touchcancel',
      this.up,
      true
    );
    this.parentElement.removeEventListener('touchstart', this.up, true);
  },

  methods: {
    deselect(e) {
      if (!this.$el.contains(e.target)) {
        this.$emit('deactivated');
      }
    },

    move(ev) {
      if (!this.stickDrag && !this.bodyDrag) {
        return;
      }

      ev.stopPropagation();

      if (this.stickDrag) {
        this.stickMove(ev);
      }
      if (this.bodyDrag) {
        this.bodyMove(ev);
      }
    },

    up(ev) {
      if (this.stickDrag) {
        this.stickUp(ev);
      }
      if (this.bodyDrag) {
        this.bodyUp(ev);
      }
    },

    bodyDown(ev) {
      if (!this.preventActiveBehavior) {
        this.$emit('activated');
      }

      if (ev.button !== 0) {
        return;
      }

      this.$emit('click', ev);

      if (!this.isDraggable) {
        return;
      }

      this.bodyDrag = true;

      this.stickStartPos.mouseX = ev.pageX || ev.touches[0].pageX;
      this.stickStartPos.mouseY = ev.pageY || ev.touches[0].pageY;

      this.stickStartPos.left = this.rawLeft;
      this.stickStartPos.right = this.right;
      this.stickStartPos.top = this.rawTop;
      this.stickStartPos.bottom = this.bottom;
    },
    bodyMove(ev) {
      const stickStartPos = this.stickStartPos;

      const delta = {
        x:
          (this.axis !== 'y' && this.axis !== 'none'
            ? stickStartPos.mouseX - (ev.pageX || ev.touches[0].pageX)
            : 0) * this.zoom,
        y:
          (this.axis !== 'x' && this.axis !== 'none'
            ? stickStartPos.mouseY - (ev.pageY || ev.touches[0].pageY)
            : 0) * this.zoom,
      };
      // let delta = this.delta;
      if (this.sticky) {
        const { left, top } = stickStartPos;
        const { x: deltaX, y: deltaY } = delta;
        const correctedX = this.getCorrectedX(left - deltaX, deltaX > 0);
        delta.x = left - correctedX;
        const correctedY = this.getCorrectedY(top - deltaY, deltaY > 0);
        delta.y = top - correctedY;
      }
      this.delta = delta;
      this.rawTop = stickStartPos.top - delta.y;
      this.rawBottom = stickStartPos.bottom + delta.y;
      this.rawLeft = stickStartPos.left - delta.x;
      this.rawRight = stickStartPos.right + delta.x;
      const hasMoved = Math.abs(this.delta.x) > 1 || Math.abs(this.delta.y) > 1;
      if (hasMoved) {
        if (!this.inDrag) {
          this.$emit('dragStart');
          this.inDrag = true;
        }
      }
      this.$emit('dragging', this.rect);
      // this.$emit('dragging', this.delta);

      // 这里取到的this.rect.left慢了一步 先取rect.left 再算this.left 同理rawTop
      // 解决办法 去掉left 只留rawLeft
      // todo 此时的rect.width不准确
    },
    getCorrectedX(val) {
      // todo 重复代码
      for (let tick of this.xLines) {
        let d = val - tick;
        if (d >= 0 && d <= dangerDistance) {
          return tick;
        }
        d = tick - this.w - val;
        if (d >= 0 && d <= dangerDistance) {
          return tick - this.w;
        }
      }
      return val;
    },
    getCorrectedY(val) {
      // todo 重复代码
      for (let tick of this.yLines) {
        let d = val - tick;
        if (d >= 0 && d <= dangerDistance) {
          return tick;
        }
        d = tick - this.h - val;
        if (d >= 0 && d <= dangerDistance) {
          return tick - this.h;
        }
      }
      return val;
    },

    bodyUp() {
      this.bodyDrag = false;
      this.inDrag = false;
      if (Math.abs(this.delta.x) > 1 || Math.abs(this.delta.y) > 1) {
        this.$emit('dragstop', this.rect);
      }
      this.stickStartPos = { mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0 };
      // this.delta = { x: 0, y: 0 };
    },

    stickDown: function (stick, ev) {
      if (!this.isResizable || !this.isActive) {
        return;
      }

      this.stickDrag = true;
      this.stickStartPos = {
        ...this.stickStartPos,
        mouseX: ev.pageX || ev.touches[0].pageX,
        mouseY: ev.pageY || ev.touches[0].pageY,
        left: this.rawLeft,
        right: this.right,
        top: this.rawTop,
        bottom: this.bottom,
      };

      this.currentStick = stick.split('');
      this.stickAxis = null;

      switch (this.currentStick[0]) {
        case 'b':
          this.stickAxis = 'y';
          break;
        case 't':
          this.stickAxis = 'y';
          break;
      }
      switch (this.currentStick[1]) {
        case 'r':
          this.stickAxis = this.stickAxis === 'y' ? 'xy' : 'x';
          break;
        case 'l':
          this.stickAxis = this.stickAxis === 'y' ? 'xy' : 'x';
          break;
      }
      this.$emit('resizeStart');
    },
    stickMove(ev) {
      const stickStartPos = this.stickStartPos;

      const delta = {
        x:
          (stickStartPos.mouseX - (ev.pageX || ev.touches[0].pageX)) *
          this.zoom,
        y:
          (stickStartPos.mouseY - (ev.pageY || ev.touches[0].pageY)) *
          this.zoom,
      };

      switch (this.currentStick[0]) {
        case 'b':
          this.rawBottom = stickStartPos.bottom + delta.y;
          break;
        case 't':
          this.rawTop = stickStartPos.top - delta.y;
          break;
      }

      switch (this.currentStick[1]) {
        case 'r':
          this.rawRight = stickStartPos.right + delta.x;
          break;
        case 'l':
          this.rawLeft = stickStartPos.left - delta.x;
          break;
      }

      this.$emit('resizing', this.rect);
    },

    stickUp() {
      this.stickDrag = false;
      this.stickStartPos = {
        mouseX: 0,
        mouseY: 0,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      };
      this.rawBottom = this.bottom;
      this.rawRight = this.right;

      this.stickAxis = null;

      this.$emit('resizing', this.rect);
      this.$emit('resizestop', this.rect);
    },
  },

  computed: {
    style() {
      return {
        top: this.rawTop + 'px',
        left: this.rawLeft + 'px',
        width: this.width + 'px',
        height: this.height + 'px',
        zIndex: this.zIndex,
      };
    },

    vdrStick() {
      return stick => {
        const stickStyle = {
          width: `${stickSize * this.zoom}px`,
          height: `${stickSize * this.zoom}px`,
        };
        stickStyle[styleMapping.y[stick[0]]] = `${-stickBorderSize *
          this.zoom}px`;
        stickStyle[styleMapping.x[stick[1]]] = `${-stickBorderSize *
          this.zoom}px`;
        return stickStyle;
      };
    },

    width() {
      return this.parentWidth - this.rawLeft - this.right;
    },

    height() {
      return this.parentHeight - this.rawTop - this.bottom;
    },

    rect() {
      const round = Math.round;
      return {
        left: round(this.rawLeft),
        top: round(this.rawTop),
        width: round(this.width),
        height: round(this.height),
      };
    },
  },

  watch: {
    rawRight(newRight) {
      this.right = newRight;
    },

    rawBottom(newBottom) {
      this.bottom = newBottom;
    },

    z(val) {
      if (val >= 0 || val === 'auto') {
        this.zIndex = val;
      }
    },

    aspectRatio(val) {
      if (val) {
        this.aspectFactor = this.width / this.height;
      }
    },

    minw(val) {
      if (val > 0 && val <= this.width) {
        this.minWidth = val;
      }
    },

    minh(val) {
      if (val > 0 && val <= this.height) {
        this.minHeight = val;
      }
    },

    x() {
      let delta = this.x - this.rawLeft;
      this.rawLeft = this.x;
      this.rawRight = this.right - delta;
    },

    y() {
      let delta = this.y - this.rawTop;
      this.rawTop = this.y;
      this.rawBottom = this.bottom - delta;
    },

    w() {
      if (this.stickDrag || this.bodyDrag) {
        return;
      }
      this.currentStick = ['m', 'r'];
      this.stickAxis = 'x';
      let delta = this.width - this.w;
      this.rawRight = this.right + delta;
    },

    h() {
      if (this.stickDrag || this.bodyDrag) {
        return;
      }
      this.currentStick = ['b', 'm'];
      this.stickAxis = 'y';
      let delta = this.height - this.h;
      this.rawBottom = this.bottom + delta;
    },
  },
};
