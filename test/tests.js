
var isVisible = require('visible')
var assert = require('assert')
var tests = [].slice.call(document.querySelectorAll('[data-test]'))

describe('visible elements', function(){
  var els = tests.filter(function(el){ return el.getAttribute('data-visible') && el.getAttribute('data-visible') !== 'invisible'  });

  els.forEach(function(el){
    it(el.getAttribute('data-test'), function(){
      assert(isVisible(el));
    });
  });
});

describe('invisible elements', function(){
  var els = tests.filter(function(el){ return !el.getAttribute('data-visible') || el.getAttribute('data-visible') === 'invisible'  });

  els.forEach(function(el){
    it(el.getAttribute('data-test'), function(){
      assert(!isVisible(el));
    });
  });
});
