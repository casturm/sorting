var animateSlide = function(array, rightIndex, value, j) {
  var div1 = array[j];
  var div2 = array[j+1];
  var tmp = div1.style.height;

  div1.style.height = div2.style.height;
  div2.style.height = tmp;

  div1.className = 'bar m';

  if ((j+1) == rightIndex) {
    div2.className = 'bar p';
  }
  else {
    div2.className = 'bar';
  }

  setTimeout(() => {
    animateInsert(array, rightIndex, value, j-1);
  }, 200);
}

var animateInsert = function(array, rightIndex, value, j) {
  var div1 = array[j];
  var div2 = array[j+1];

  if (j >= 0 && height(div1) > value) {
    animateSlide(array, rightIndex, value, j);
  }
  else { 
    div2.style.bottom = '10px';

    if ((j+1) == rightIndex) {
      div1.className = 'bar m';
      div2.className = 'bar p';
    }

    setTimeout(() => {
      if (div1) {
        div1.style.bottom = '0px';
      }

      if ((j+1) == rightIndex) {
        div1.className = 'bar';
      }

      div2.style.bottom = '0px';
      div2.style.height = value + 'px'; 

      setTimeout(() => {
        div2.className = 'bar';
        animateInsertion(array, rightIndex+1);
      }, 500);
    }, 500);
  }   
};

var animateInsertion = function(array, rightIndex=1) {
  if (rightIndex < array.length) {
    var j = rightIndex - 1;
    array[j].className = 'bar p';
    array[rightIndex].className = 'bar m';
    setTimeout(() => {
      animateInsert(array, rightIndex, height(array[rightIndex]), j);
    }, 200);
  }
  else {
    // reset the right most bar class
    array[rightIndex-1].className = 'bar';
    setTimeout(() => {
      startInsertionSort();
    }, 5000);
  }
};
