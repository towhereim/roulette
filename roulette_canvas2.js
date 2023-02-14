var rouletteData;
var options;
var weights;
var startAngle = 0;
var arc;
var spinTimeout = null;
var weightsSum;
var spinArcStart = 10;
var spinTime;
var spinTimeTotal;
var angles = [];
var ctx;

function init() {
  rouletteData = JSON.parse(localStorage.getItem('rouletteData'));
  options = rouletteData["items"];
  weights = rouletteData["weights"];

  startAngle = 0;
  arc = Math.PI / (options.length / 2);

  spinTimeout = null;
  spinTime = 0;
  spinTimeTotal = 0;

  weightsSum = weights.reduce(function add(sum, currValue) { return sum + currValue; }, 0);

  var weightAccum = 0;
  for (let i = 0; i < weights.length; i++) {
    weightAccum += weights[i];
    angles.push(Math.round(360 * (weightAccum / weightsSum) * 10) / 10);
  }
}

document.getElementById("spin").addEventListener("click", spin);

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
}

function RGB2Color(r, g, b) {
  return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
  var phase = 0;
  var center = 128;
  var width = 127;
  var frequency = Math.PI * 2 / maxitem;

  red = Math.sin(frequency * item + 2 + phase) * width + center;
  green = Math.sin(frequency * item + 0 + phase) * width + center;
  blue = Math.sin(frequency * item + 4 + phase) * width + center;

  return RGB2Color(red, green, blue);
}

function drawRouletteWheel() {
  init();
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = 200;
    var textRadius = 160;
    var insideRadius = 80;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 500, 500);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    ctx.font = "15px AppleSDGothic";

    for (var i = 0; i < options.length; i++) {
      var weightsSumUptoi = 0;
      for (let n = 0; n < i; n++) {
        weightsSumUptoi += weights[n];
      }
      //var weightsSumToi = weights.reduce(function add(sum, currValue) {n++;if(n==i){break;}; return sum + currValue; }, 0);
      //console.log("weightSum : " + weightsSum); 161
      var arc = Math.PI * 2 * (weights[i] / weightsSum);
      var arcUptoi = Math.PI * 2 * (weightsSumUptoi / weightsSum);
      // console.log("startAngle : " + startAngle + "   i : " + i + "    arc : " + arc);
      // console.log("weights[i] :" + weights[i] + "   weightedArc:" + arc);
      //console.log("arc: "+arc+"   arcUptoi: "+arcUptoi);
      var angle = startAngle + arcUptoi;
      //var angle = startAngle + i * arc;
      //ctx.fillStyle = colors[i];
      ctx.fillStyle = getColor(i, options.length);

      ctx.beginPath();
      ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
      ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur = 0;
      ctx.shadowColor = "rgb(220,220,220)";
      ctx.fillStyle = "black";
      ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius,
        250 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI);
      var text = options[i];

      ctx.fillText(text, -ctx.measureText(text).width / 2, 5);
      ctx.restore();
    }

    //Arrow
    ctx.fillStyle = "black";
    ctx.beginPath();

    ctx.arc(250, 35, 7, 0, Math.PI * 2, false);
    ctx.arc(250, 35, 3, 0, Math.PI * 2, true);
    ctx.moveTo(250 - 6, 250 - (outsideRadius + 12));
    ctx.lineTo(250 + 6, 250 - (outsideRadius + 12));
    ctx.lineTo(250, 250 - (outsideRadius - 2));
    ctx.fill();
  }
}

function spin() {
  // spinAngleStart = 216; for Test
  spinAngleStart = Math.random() * 20 + 10;
  spinTime = 0;
  // spinTimeTotal = 180; for Test
  spinTimeTotal = Math.random() * 3 + 4 * 3000;
  rotateWheel();
}

function rotateWheel() {
  spinTime += 30;
  if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  // var index = Math.floor((360 - degrees % 360) / arcd);
  var stopAngle = Math.round(360 - degrees % 360);
  var index = 0;
  for (let i = 0; i < angles.length; i++) {
    if (stopAngle < angles[i]) {
      index = i;
      break;
    }

  }

  console.log("degrees: " + degrees + " stopAngle: " + stopAngle + "   index :" + index + "   person : " + options[index]);
  console.log(index);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = options[index]
  ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  ctx.restore();
}

function easeOut(t, b, c, d) {
  var ts = (t /= d) * t;
  var tc = ts * t;
  return b + c * (tc + -3 * ts + 3 * t);
}

drawRouletteWheel();