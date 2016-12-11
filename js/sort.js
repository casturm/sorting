var SORT = SORT || {};

SORT.CANVAS_ID = "canvas";
SORT.CANVAS_WIDTH = 600;
SORT.CANVAS_TOP = 225;
SORT.NUMBER_OF_BARS = 12;
SORT.BAR_COLOR_RED = 'bar-red'; 
SORT.BAR_WIDTH = 25;
SORT.BAR_CORNER_RADIUS = 3;
SORT.BAR_GAP = 7;
SORT.BAR_FACTOR = 10;
SORT.BAR_MAX_VALUE = 160;
SORT.BAR_MARGIN_LEFT = ((SORT.CANVAS_WIDTH / 2) - ((SORT.NUMBER_OF_BARS * (SORT.BAR_WIDTH + SORT.BAR_GAP)) / 2));
SORT.BLINK_INTERVAL = 100;
SORT.BLINK_TIMEOUT = 1000;

SORT.array = new Array();

SORT.randomValue = () => {
  return Math.floor(Math.random() * SORT.BAR_MAX_VALUE) + SORT.BAR_FACTOR;
}

SORT.svg = (type) => {
  return document.createElementNS("http://www.w3.org/2000/svg", type);
}

SORT.calcX = (position) => {
  return ((SORT.BAR_WIDTH + SORT.BAR_GAP) * position) + SORT.BAR_MARGIN_LEFT;
}
SORT.calcY = (value) =>  SORT.CANVAS_TOP - value;

SORT.constants = {
  colors: {
    red: 'rgb(220, 20, 60)',
  }
}

SORT.getR = (i) => { return SORT.array[i].getR(); }
SORT.getG = (i) => { return SORT.array[i].getG(); }

SORT.animateColorChange = (i, className) => {
  SORT.getR(i).setAttribute('class', className);
}

SORT.runSelectionSort = (i=0) => {
  if (i < SORT.array.length) {
    SORT.animateIndexOfMinAndSwap(i);
  }
}

SORT.animateIndexOfMinAndSwap = (i) => {
  var steps = SORT.makeIterationSteps(i, SORT.array.length-1);
  SORT.animateIndexOfMin(steps, i, (min) => {
    SORT.events.addListener('swapDone', () => {
      //console.log('swap listener ' + min);
      if (min !== i) {
        SORT.animateColorChange(min, 'bar-to-red');
      }
      SORT.runSelectionSort(i+1)
    });
    SORT.animateSwap(i, min, 'swapDone');
  });
}

SORT.animateIndexOfMin = (steps, m, callback, timeout=500) => {
  if (steps.length > 0) {
    var step = steps.shift();
    SORT.animateColorChange(step, 'bar-to-green');
    setTimeout(() => {
      if (SORT.array[step].getV() <= SORT.array[m].getV()) {
        SORT.animateColorChange(m, 'bar-to-red');
        m = step;
        SORT.animateColorChange(m, 'bar-to-green');
      }
      else {
        SORT.animateColorChange(step, 'bar-to-red');
      }
      SORT.animateIndexOfMin(steps, m, callback);
    }, timeout);
  }
  else {
    if (callback) {
      callback.call(this, m);
    }
  }
}

SORT.animateSwap = (i, j, listener, timeout=1000) => {
  console.log(i + "," + j + ' ' + listener);
  SORT.animateColorChange(i, 'bar-to-blue');
  SORT.animateColorChange(j, 'bar-to-blue');

  setTimeout(() => {
    var iX = SORT.calcX(i);
    var jX = SORT.calcX(j);

    var count = 2;
    SORT.events.addListener('translateBothDone', () => {
      SORT.events.notify(listener);
    });
    SORT.events.addListener('translateOneDone', () => {
      count--;
      if (count == 0) {
        SORT.events.notify('translateBothDone');
      }
    });
    SORT.animateTraslateX(SORT.array[i], jX, 'translateOneDone');
    SORT.animateTraslateX(SORT.array[j], iX, 'translateOneDone');

    var t = SORT.array[i];
    SORT.array[i] = SORT.array[j];
    SORT.array[j] = t;
  }, timeout);
}

SORT.makeIterationSteps = (from, to) => {
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

SORT.animateTraslateX = (b, toX, listener) => {
  var fromX = b.getX();
  var cycle = SORT.makeIterationSteps(fromX, toX);
  SORT.runCycle(b, cycle, listener);
  console.log('translateX ' + b.getV() + ' done');
}

SORT.runCycle = (b, cycle, listener) => {
  if ((toX = cycle.shift())) {
    b.draw(toX);
    setTimeout(() => { SORT.runCycle(b, cycle, listener); }, 5);
  }
  else {
    SORT.events.notify(listener);
  }
}

SORT.events = {
  listeners: new Array(),
  addListener: (name, callback) => {
    SORT.events.listeners[name] = callback;
  },
  removeListener: (name) => {
    SORT.events.listeners[name] = null;
  },
  notify: (name) => {
    console.log('notify ' + name);
    if ((el = SORT.events.listeners[name])) {
      console.log('call ' + el);
      el.call();
    }
  }
};

SORT.Bar = (g, r, x, y, v) => {
  r.setAttribute('width', SORT.BAR_WIDTH);
  r.setAttribute('height', v);
  r.setAttribute('rx', SORT.BAR_CORNER_RADIUS);
  r.setAttribute('ry', SORT.BAR_CORNER_RADIUS);
  //r.style.fill = SORT.constants['colors']['red'];
  r.setAttribute('class', SORT.BAR_COLOR_RED);
  return {
    getG: () => g,
    getR: () => r,
    getX: () => x,
    getY: () => y,
    getV: () => v,
    //attrs: () => { return SORT.Attributes(g, r, x, y, v) },
    draw: (newX=x, newY=y) => {
      g.setAttribute('transform', "translate("+ newX + "," + newY + ")");
      x = newX;
      y = newY;
    }
  };
};

SORT.makeBar = (i=0) => {
  var g = SORT.svg('g');
  var r = SORT.svg('rect');
  var v = SORT.randomValue();
  var x = SORT.calcX(i);
  var y = SORT.calcY(v);
  g.appendChild(r);
  SORT.canvas().appendChild(g);
  return SORT.Bar(g, r, x, y, v);
}

SORT.canvas = () => {
  return document.getElementById(SORT.CANVAS_ID);
}

SORT.clearCanvas = () => {
  var c = SORT.canvas();
  while (c.hasChildNodes()) {
    c.removeChild(c.lastChild);
  };
}

SORT.init = () => {
  SORT.clearCanvas(); 
  for (var i = 0; i < SORT.NUMBER_OF_BARS; i++) {
    var b = SORT.makeBar(i);
    b.draw();
    SORT.array.push(b);
  }
};

SORT.init();

/*

SORT.Attributes = (g, r, x, y, v) => {
  return { G: g, R: r, X: x, Y: y, V: v }
}

SORT.runIterationAnimation = (start=0, end=(SORT.array.length-1), timeout=1000) => {
  var steps = SORT.makeIterationSteps(start, end);
  SORT.animateIteration(steps, timeout);
}

SORT.animateIteration = (steps, timeout) => {
  if ((step = steps.shift()) !== undefined) {
    SORT.animateColorChange(step, 'bar-to-blue');
    SORT.events.addListener(step, () => {
      SORT.animateIteration(steps, timeout);
    });
    setTimeout(() => {
      SORT.animateColorChange(step, 'bar-to-red');
      SORT.events.notify(step); 
    }, timeout);
  }
}
*/

