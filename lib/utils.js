Array.prototype.clone = function() { return this.slice(0); }
Array.prototype.shuffle = function() {
  for(var j, x, i = this.length; i; j = randomNumber(i), x = this[--i], this[i] = this[j], this[j] = x);
  return this;
};
Array.prototype.indexOf = function (value) {
  for(var i=0; i<this.length; i++) {
    if(this[i] === value) {
      return i;
    }
  }
}
Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

Array.prototype.swap = function (x, y) {
  if(x>this.length || y>this.length || x === y) {return}
  var tem = this[x];
  this[x] = this[y];
  this[y] = tem;
}
function randomPoint() {
  var randomx = randomNumber(WIDTH);
  var randomy = randomNumber(HEIGHT);
  var randomPoint = new Point(randomx, randomy);
  return randomPoint;
}
function randomNumber(boundary) {
  return parseInt(Math.random() * boundary);

}
