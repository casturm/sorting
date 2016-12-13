var SORT = SORT || {};

(function(ns) {
  const CANVAS_ID = "canvas";
  const CANVAS_WIDTH = 600;
  const CANVAS_TOP = 225;
  const NUMBER_OF_BARS = 12;
  const BAR_COLOR_RED = 'bar-red'; 
  const BAR_WIDTH = 25;
  const BAR_CORNER_RADIUS = 3;
  const BAR_GAP = 7;
  const BAR_FACTOR = 10;
  const BAR_MAX_VALUE = 160;
  const BAR_MARGIN_LEFT = ((CANVAS_WIDTH / 2) - ((NUMBER_OF_BARS * (BAR_WIDTH + BAR_GAP)) / 2));
  const BLINK_INTERVAL = 100;
  const BLINK_TIMEOUT = 1000;

  ns.runSelectionSort = (i=0) => {
    if (i < bars.length) {
      animateIndexOfMinAndSwap(i);
    }
  }

  var animateIndexOfMinAndSwap = (i) => {
    var barI = bars[i];
    var steps = makeIterationSteps(i, bars.length-1);
    animateIndexOfMin(steps, i, (min) => {
      events.addListener('swapDone', () => {
        if (min !== i) {
          var barM = bars[min];
          barM.animateColorChange('bar-to-red');
        }
        ns.runSelectionSort(i+1)
      });
      animateSwap(i, min, 'swapDone');
    });
  }

  var animateIndexOfMin = (steps, m, callback, timeout=500) => {
    if (steps.length > 0) {
      var step = steps.shift();
      var bar = bars[step];
      var barM = bars[m];
      bar.animateColorChange('bar-to-green');
      setTimeout(() => {
        if (bar.getV() <= barM.getV()) {
          barM.animateColorChange('bar-to-red');
          m = step;
          barM = bars[m];
          barM.animateColorChange('bar-to-green');
        }
        else {
          bar.animateColorChange('bar-to-red');
        }
        animateIndexOfMin(steps, m, callback);
      }, timeout);
    }
    else {
      if (callback) {
        callback.call(this, m);
      }
    }
  }

  var animateSwap = (i, j, listener, timeout=1000) => {
    var barI = bars[i];
    var barJ = bars[j];
    barI.animateColorChange('bar-to-blue');
    barJ.animateColorChange('bar-to-blue');

    setTimeout(() => {
      var iX = canvas.calcX(i);
      var jX = canvas.calcX(j);

      var count = 2;
      events.addListener('translateBothDone', () => {
        events.notify(listener);
      });
      events.addListener('translateOneDone', () => {
        count--;
        if (count == 0) {
          events.notify('translateBothDone');
        }
      });
      animateTraslateX(bars[i], jX, 'translateOneDone');
      animateTraslateX(bars[j], iX, 'translateOneDone');

      var t = bars[i];
      bars[i] = bars[j];
      bars[j] = t;
    }, timeout);
  }

  var makeIterationSteps = (from, to) => {
    var cycle = new Array();
    if (from > to) {
      while (from > to) {
        cycle.push(from);
        from -= 1;
      }
    }
    else {
      while (from < to) {
        cycle.push(from);
        from += 1;
      }
    }
    cycle.push(to);
    return cycle;
  }

  var animateTraslateX = (b, toX, listener) => {
    var fromX = b.getX();
    var cycle = makeIterationSteps(fromX, toX);
    var timeout = 500 / cycle.length;
    runCycle(b, cycle, timeout, listener);
  }

  var runCycle = (b, cycle, timeout, listener) => {
    if ((toX = cycle.shift())) {
      b.draw(toX);
      setTimeout(() => { runCycle(b, cycle, timeout, listener); }, timeout);
    }
    else {
      events.notify(listener);
    }
  }

  var events = {
    listeners: new Array(),
    addListener: (name, callback) => {
      events.listeners[name] = callback;
    },
    removeListener: (name) => {
      events.listeners[name] = null;
    },
    notify: (name) => {
      console.log('notify ' + name);
      if ((el = events.listeners[name])) {
        console.log('call ' + el);
        el.call();
      }
    }
  };
  
  var Bar = function(i) {
    var g = canvas.svg('g');
    var r = canvas.svg('rect');
    var v = Math.floor(Math.random() * BAR_MAX_VALUE) + BAR_FACTOR;
    var x = canvas.calcX(i);
    var y = canvas.calcY(v);
    g.appendChild(r);
    canvas.appendChild(g);
    r.setAttribute('width', BAR_WIDTH);
    r.setAttribute('height', v);
    r.setAttribute('rx', BAR_CORNER_RADIUS);
    r.setAttribute('ry', BAR_CORNER_RADIUS);
    r.setAttribute('class', BAR_COLOR_RED);
    return {
      index: () => i,
      getX: () => x,
      getY: () => y,
      getV: () => v,
      animateColorChange: (className) => {
        r.setAttribute('class', className);
      },
      draw: (newX=x, newY=y) => {
        g.setAttribute('transform', "translate("+ newX + "," + newY + ")");
        x = newX;
        y = newY;
      }
    };
  }

  var canvas = (function() {
    var bars = new Array();
    var c = document.getElementById(CANVAS_ID);
    return {
      bars: bars,
      svg: (type) => {
        return document.createElementNS("http://www.w3.org/2000/svg", type);
      },
      calcX: (position) => {
        return ((BAR_WIDTH + BAR_GAP) * position) + BAR_MARGIN_LEFT;
      },
      calcY: (value) => CANVAS_TOP - value,
      appendChild: (g) => c.appendChild(g),
      clear: () => {
        while (c.hasChildNodes()) {
          c.removeChild(c.lastChild);
        }
      },
      draw: () => {
        for (var i = 0; i < NUMBER_OF_BARS; i++) {
          var b = new Bar(i);
          b.draw();
          bars.push(b);
        }
      }
    }
  })();
  
  var bars = canvas.bars;
  ns.init = () => {
    canvas.clear(); 
    canvas.draw();
  };
})(SORT);

/*

Attributes = (g, r, x, y, v) => {
  return { G: g, R: r, X: x, Y: y, V: v }
}

runIterationAnimation = (start=0, end=(bars.length-1), timeout=1000) => {
  var steps = makeIterationSteps(start, end);
  animateIteration(steps, timeout);
}

animateIteration = (steps, timeout) => {
  if ((step = steps.shift()) !== undefined) {
    animateColorChange(step, 'bar-to-blue');
    events.addListener(step, () => {
      animateIteration(steps, timeout);
    });
    setTimeout(() => {
      animateColorChange(step, 'bar-to-red');
      events.notify(step); 
    }, timeout);
  }
}
*/

