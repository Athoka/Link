collision: function(col) {
  var p = this.entity.p;

  if (
    p.stepping &&
    ((p.direction === 'up' && col.normalY === 1) ||
    (p.direction === 'down' && col.normalY === -1) ||
    (p.direction === 'left' && col.normalX === 1) ||
    (p.direction === 'right' && col.normalX === -1))
  ) {
    p.stepping = false;
    p.x = p.origX;
    p.y = p.origY;
  }
},