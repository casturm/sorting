var animateSwap = function(array, i, m) {
  var div1 = array[i];
  var div2 = array[m];

  var tmp = div1.left
  div1.
  div2.style.bottom = '10px';

  setTimeout(() => {
    div1.style.height = div2.style.height;
    div2.style.height = tmp;
    div1.className = ' bar m';
    div2.className = ' bar p';
    setTimeout(() => {
      div1.style.bottom = '0px';
      div2.style.bottom = '0px';
      div1.className = ' bar';
      div2.className = ' bar';
      animateSelection(array, i+1);
    }, 500);
  }, 500);
}

var animateIndexOfMinimum = function(array, i, j, m) {
  if (j == array.length) {
    array[i].className += ' p';
    array[m].className += ' m';
    animateSwap(array, i, m);
  }
  else { 
    array[i].className += ' p';
    array[j].className += ' m';

    setTimeout(() => {
      array[i].className = ' bar';

      var m_height = height(array[m]);
      var j_height = height(array[j]);
      if (j_height < m_height) {
        if (m != i) {
          array[m].className = ' bar';
        }
        m = j;
      }
      else {
        array[j].className = ' bar';
      }
      animateIndexOfMinimum(array, i, j+1, m)
    }, 200);
  }   
};

var animateSelection = function(array, i=0) {
  setTimeout(() => {
    if (i < array.length) {
      var j = i;
      var minIndex = i;
      animateIndexOfMinimum(array, i, j+1, minIndex);
    }
    else {
      setTimeout(() => {
        startSelectionSort();
      }, 5000);
    }
  }, 200);
};
