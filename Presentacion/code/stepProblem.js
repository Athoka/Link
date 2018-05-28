collision: function(col) {
  var p = this.entity.p;

  if (p.stepping) {
    p.stepping = false;
    p.x = p.origX;
    p.y = p.origY;
  }
},