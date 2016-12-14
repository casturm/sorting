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
    animateIteration(0);
  }

  var animateIteration = (i=0) => {
    if (i < bars.length) {
      animateIndexOfMin(i, i, (m) => {
        animateSwap(i, m, () => { 
          animateIteration(i+1);
        });
      });
    }
  }

  var animateIndexOfMin = (i, m, callback, timeout=500) => {
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
      }, timeout);
    }
    else {
      callback(m);
    }
  }

  var animateSwap = (i, j, callback, timeout=1000) => {
    bars[i].animateColorChange('bar-to-blue');
    bars[j].animateColorChange('bar-to-blue');

    setTimeout(() => {
      var iX = canvas.calcX(i);
      var jX = canvas.calcX(j);
      var pi = new Promise((complete) => {
        animateTranslateX(bars[i], jX, complete); 
      });
      var pj = new Promise((complete) => {
        animateTranslateX(bars[j], iX, complete); 
      });
      Promise.all([pi, pj]).then(() => {
        if (i != j) {
          bars[i].animateColorChange('bar-to-red');
        }
        var t = bars[i];
        bars[i] = bars[j];
        bars[j] = t;
        callback();
      });
    }, timeout);
  }

  var animateTranslateX = (b, toX, callback) => {
    var fromX = b.getX();
    var moves = makeMoves(fromX, toX);
    moves = moves.map((x) => { return { x: x, y: b.getY() } });
    var delay = (1/moves.length) * 500;
    move(b, moves, delay, callback);
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

  var move = (b, moves, delay, callback) => {
    if ((coords = moves.shift())) {
      b.draw(coords.x, coords.y);
      setTimeout(() => {
        move(b, moves, delay, callback);
      }, delay);
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
  
  ns.bars = canvas.bars;
  var bars = ns.bars;

  ns.init = () => {
    canvas.clear(); 
    canvas.draw();
  };
})(SORT);
