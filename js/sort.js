var SORT = SORT || {};

(function(ns) {
  const CANVAS_ID = "canvas";
  const CANVAS_WIDTH = 600;
  const CANVAS_TOP = 225;
  const NUMBER_OF_BARS = 12;
  const BAR_COLOR_RED = 'bar-to-red';
  const BAR_WIDTH = 25;
  const BAR_CORNER_RADIUS = 3;
  const BAR_GAP = 7;
  const BAR_FACTOR = 10;
  const BAR_MAX_VALUE = 160;
  const BAR_MARGIN_LEFT = ((CANVAS_WIDTH / 2) - ((NUMBER_OF_BARS * (BAR_WIDTH + BAR_GAP)) / 2));
  const BLINK_INTERVAL = 100;
  const BLINK_TIMEOUT = 1000;

  var animateSelection = (i=0) => {
    if (i < bars.length) {
      animateIndexOfMin(i, i, (m) => {
        bars[i].animateColorChange('bar-to-blue');
        bars[m].animateColorChange('bar-to-blue');
        animateSwap(i, m, () => { 
          if (i != m) {
            bars[m].animateColorChange('bar-to-red');
          }
          animateSelection(i+1);
        });
      });
    }
    else {
      bars.reverse().map((b) => { b.animateColorChange('bar-to-red') });
    }
  }
  ns.animateSelection = animateSelection;

  var animateIndexOfMin = (i, m, callback) => {
    if (i < bars.length) {
      bars[i].animateColorChange('bar-to-green');
      setTimeout(() => {
        if (bars[i].getV() <= bars[m].getV()) {
          bars[m].animateColorChange('bar-to-red');
          m = i;
          bars[m].animateColorChange('bar-to-green');
        }
        else {
          bars[i].animateColorChange('bar-to-red');
        }
        animateIndexOfMin(i+1, m, callback);
      }, delay());
    }
    else {
      callback(m);
    }
  }

  var animateSwap = (i, j, callback) => {
    var iX = canvas.calcX(i);
    var jX = canvas.calcX(j);
    var pi = new Promise((complete) => {
      animateTranslateX(bars[i], jX, complete);
    });
    var pj = new Promise((complete) => {
      animateTranslateX(bars[j], iX, complete);
    });
    Promise.all([pi, pj]).then(() => {
      var t = bars[i];
      bars[i] = bars[j];
      bars[j] = t;
      callback();
    });
  }
  ns.animateSwap = animateSwap;

  var animateInsertion = (i=1) => {
    if (i < bars.length) {
      animateTranslateY(bars[i], CANVAS_TOP + 5, () => {
        bars[i].animateColorChange('bar-to-blue');
        animateInsert(i-1, i, bars[i].getV(), (m) => {
          animateTranslateY(bars[m], CANVAS_TOP - bars[m].getV(), () => {
            bars.slice(0, i+1).map((b) => { b.animateColorChange('bar-to-orange') });
            animateInsertion(i+1)
          });
        });
      });
    }
    else {
      bars.reverse().map((b) => { b.animateColorChange('bar-to-red') });
    }
  }
  ns.animateInsertion = animateInsertion;

  var animateInsert = (j, rightMost, value, callback) => {
    if (j >= 0 && bars[j].getV() > value) {
      bars[j].animateColorChange('bar-to-green');
      setTimeout(() => {
        animateSwap(j, (j+1), () => {
          bars[j+1].animateColorChange('bar-to-orange');
          animateInsert(j-1, rightMost, value, callback);
        });
      }, delay());
    }
    else {
      callback(j+1);
    }
  }

  ns.calcYForInsertion = (b) => CANVAS_TOP + b.getV();

  var animateTranslateY = (b, toY, callback) => {
    var moves = makeMoves(b.getY(), toY);
    animateTranslate(b, moves, callback, (y) => { return { x: b.getX(), y: y } });
  }

  var animateTranslateX = (b, toX, callback) => {
    var moves = makeMoves(b.getX(), toX);
    animateTranslate(b, moves, callback, (x) => { return { x: x, y: b.getY() } });
  }

  var animateTranslate = (b, moves, callback, f) => {
    moves = moves.map(f)
    move(b, moves, callback);
  }

  var makeMoves = (from, to) => {
    var moves = new Array();
    var inc = (from > to) ? () => --from : () => ++from;
    var distance = Math.sqrt(Math.pow((from - to), 2));
    while (--distance > 0) {
      moves.push(inc());
    }
    moves.push(to);
    return moves;
  }

  var defaultDelay = 200;

  var setDelay = (newDelay) => {
    defaultDelay = newDelay;
  }
  ns.setDelay = setDelay;

  var delay = () => {
    return defaultDelay;
  }
  ns.delay = delay;

  var moveDelay = (len) => (1/len) * delay();

  var move = (b, moves, callback) => {
    if ((coords = moves.shift())) {
      b.draw(coords.x, coords.y);
      setTimeout(() => {
        move(b, moves, callback);
      }, moveDelay(moves.length));
    }
    else {
      callback();
    }
  }

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
  ns.bars = bars;

  ns.init = () => {
    canvas.bars = new Array();
    canvas.clear(); 
    canvas.draw();
  };
})(SORT);
