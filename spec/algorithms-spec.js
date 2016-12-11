var a = require('../js/algorithms');

describe('sorting', function() {
  describe('#selectionSort()', function() {
    it('should sort an array of ints', function() {
        var array = [9, -7, 5, -11, 12, -2, 14, 0, 10, 6];
        var expected = [-11, -7, -2, 0, 5, 6, 9, 10, 12, 14];
        a.selectionSort(array);
        expect(array).toEqual(expected);
    });
  });
});
