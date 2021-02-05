const c = function(a, b) {
  for (var c = 0; (c += 10), !(c / a > b); );
  if (10 >= c) {
    for (c = 0; (c += 2), !(c / a > b); );
    return Math.max(1, c - 2);
  }
  return c - 10;
};
const d = function(a, b, d, e) {
  for (
    var f = Math.abs,
      g = 0,
      h = '',
      j = !1,
      k = void 0,
      l = void 0,
      m = c(e, 8),
      n = 0;
    n < e * b;
    n += m
  )
    if (
      ((j = !1),
      (h = ''),
      (k = n),
      (l = k / e + 40),
      0 === k % (2 * (10 * m))
        ? ((g = 0), (h = f(k)), (j = !0))
        : 0 === k % (10 * m)
        ? ((g = d - 6), (h = f(k)), (j = !0))
        : 0 === k % m && ((g = d - 3), (j = !0)),
      j)
    ) {
      var i = 0.5;
      a.moveTo(l + i, d + i),
        a.lineTo(l + i, g + i),
        a.fillText(h, l + 2.5, d / 2);
    }
};
export default function(ctx, b, c) {
  const { scale, width, height, canvasConfigs } = c;
  const { bgColor, fontColor, ratio } = canvasConfigs;
  if (scale !== 0) {
    ctx.scale(ratio, ratio);
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    ctx.beginPath();
    ctx.font = '10px Microsoft YaHei';
    ctx.fillStyle = fontColor;
    d(ctx, width, height, 1 / scale);
    ctx.stroke();
    ctx.closePath();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
