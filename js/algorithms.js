// common
var swap = function(array, firstIndex, secondIndex) {
  var temp = array[firstIndex];
  array[firstIndex] = array[secondIndex];
  array[secondIndex] = temp;
};


// selection sort
var indexOfMinimum = function(array, startIndex) {
  var minValue = array[startIndex];
  var minIndex = startIndex;
  
  for (var i = minIndex + 1; i < array.length; i++) {
    if (array[i] < minValue) {
      minIndex = i;
      minValue = array[i];
    } 
  }
  return minIndex;
}; 

var selectionSort = function(array) {
  for (var i = 0; i < array.length; i++) {
    var m = indexOfMinimum(array, i);
    swap(array, i, m);
  }
};

// insertion sort
var insert = function(array, rightIndex, value) {
  for(var j = rightIndex;
      j >= 0 && array[j] > value;
      j--) {
    array[j + 1] = array[j];
  }   
  array[j + 1] = value; 
};

var insertionSort = function(array) {
  for (var i = 1; i < array.length; i++) {
    insert(array, i-1, array[i]);
  }
};

// merge sort
var merge = function(array, p, q, r) {
  var lowHalf = [];
  var highHalf = [];

  var k = p;
  var i;
  var j;
  for (i = 0; k <= q; i++, k++) {
    lowHalf[i] = array[k];
  }
  for (j = 0; k <= r; j++, k++) {
    highHalf[j] = array[k];
  }

  k = p;
  i = 0;
  j = 0;

  while (i < q+1-p && j < r-p-q) {
    if (lowHalf[i] < highHalf[j]) {
      array[k] = lowHalf[i++];
    } else {
      array[k] = highHalf[j++];
    }
    k++;
  }
  while (i < q+1-p) {
    array[k++] = lowHalf[i++];
  }
  while (j < r-q-p) {
    array[k++] = highHalf[j++];
  }
};

var mergeSort = function(array, p, r) {
  if (p < r) {
    var q = floor(p + ((r - p) / 2));
    mergeSort(array, p, q);
    mergeSort(array, q+1, r);
    merge(array, p, q, r);
  }
};

// quick sort
var partition = function(array, p, r, f) {
  var q = p;
  for (var j = p; j < r; j++) {
    if (array[j] <= array[r]) {
      swap(array, j, q++);
    }
  }
  swap(array, r, q);
  return q;
};

var quickSort = function(array, p, r, f) {
  if (r - p > 0) {
    var pivot = partition(array, p, r, f);
    quickSort(array, p, pivot-1, f);
    quickSort(array, pivot+1, r, f);
  }
};

module.exports.selectionSort = selectionSort;
