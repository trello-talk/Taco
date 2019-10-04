Object.defineProperty(Number.prototype, "formatNumber", {
  enumerable: false,
  writable: true,
  value: function () {
    return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }
});

Object.defineProperty(Number.prototype, "codepoint", {
  enumerable: false,
  writable: true,
  value: function () {
    return String.fromCodePoint(this);
  }
});

Object.defineProperty(Number.prototype, "abs", {
  enumerable: false,
  writable: true,
  value: function () {
    return Math.abs(this);
  }
});

Object.defineProperty(Number.prototype, "round", {
  enumerable: false,
  writable: true,
  value: function () {
    return Math.round(this);
  }
});

Object.defineProperty(Array.prototype, "random", {
  enumerable: false,
  writable: true,
  value: function () {
    return this[Math.floor(Math.random() * ((this.length - 1) - 0 + 1)) + 0];
  }
});

Object.defineProperty(Object.prototype, "keyValueForEach", {
  enumerable: false,
  writable: true,
  value: function (func) {
    Object.keys(this).map(o => {
      func(o, this[o]);
    });
  }
});

Object.defineProperty(String.prototype, "toHHMMSS", {
  enumerable: false,
  writable: true,
  value: function () {
    var sec_num = parseInt(this, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    var time = hours + ":" + minutes + ":" + seconds;
    return time;
  }
});

Object.defineProperty(String.prototype, "int", {
  enumerable: false,
  writable: true,
  value: function () {
    return parseInt(this);
  }
});


Object.defineProperty(Object.prototype, "sliceKeys", {
  enumerable: false,
  writable: true,
  value: function (f) {
    let newObject = {};
    this.keyValueForEach((k, v) => {
      if (f(k, v)) newObject[k] = v;
    });
    return newObject;
  }
});