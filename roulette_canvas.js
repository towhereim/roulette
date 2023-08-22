var rouletteData;
var options;
var weights;

var startAngle = 0;
var arc;
var spinTimeout = null;
var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;

var ctx;

var angles = [];
var weightsSum;
var weightAccum;

var rSize = 390;
var rSizeHalf = rSize/2;
// console.log(angles);

function init() {
  if (!localStorage.getItem('rouletteData')) {
    // console.log("없어용");
    var data = {
      items: ["김둘리", "도우너", "마진가", "손낙지", "차차", "허억", "방귀남", "신난다", "엄어나", "육백만불", "최고다", "김치국"],
      weights: [100, 100, 100, 300, 100, 50, 100, 100, 200, 300, 50, 100]
    }
    localStorage.setItem('rouletteData', JSON.stringify(data));
  }
  rouletteData = JSON.parse(localStorage.getItem('rouletteData'));
  options = rouletteData["items"];
  weights = rouletteData["weights"];
  startAngle = 0;
  arc = Math.PI / (options.length / 2);
  spinTimeout = null;
  spinArcStart = 10;
  spinTime = 0;
  spinTimeTotal = 0;
  ctx;
  angles = [];
  weightsSum;
  weightAccum;

  weightsSum = weights.reduce(function add(sum, currValue) { return sum + currValue; }, 0);

  weightAccum = 0;
  for (let i = 0; i < weights.length; i++) {
    weightAccum += weights[i];
    angles.push(Math.round(360 * (weightAccum / weightsSum) * 10) / 10);
  }
  console.log(angles);
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
  var canvas = document.getElementById("canvas");

  if (canvas.getContext) {
    var outsideRadius = rSizeHalf*0.8;
    var textRadius = rSizeHalf*0.65;
    var insideRadius = rSizeHalf*0.4;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, rSize, rSize);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    ctx.font = "0.9em AppleSDGothic";

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
      ctx.arc(rSizeHalf, rSizeHalf, outsideRadius, angle, angle + arc, false);
      ctx.arc(rSizeHalf, rSizeHalf, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur = 0;
      ctx.shadowColor = "rgb(220,220,220)";
      ctx.fillStyle = "black";
      ctx.translate(rSizeHalf + Math.cos(angle + arc / 2) * textRadius,
        rSizeHalf + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI);
      var text = options[i];

      ctx.fillText(text, -ctx.measureText(text).width / 2, 5);
      ctx.restore();
    }

    //Arrow
    ctx.fillStyle = "black";
    ctx.beginPath();

    ctx.arc(rSizeHalf, rSizeHalf - (outsideRadius + 15), 7, 0, Math.PI * 2, false);
    ctx.arc(rSizeHalf, rSizeHalf - (outsideRadius + 15), 3, 0, Math.PI * 2, true);
    ctx.moveTo(rSizeHalf - 6, rSizeHalf - (outsideRadius + 12));
    ctx.lineTo(rSizeHalf + 6, rSizeHalf - (outsideRadius + 12));
    ctx.lineTo(rSizeHalf, rSizeHalf - (outsideRadius - 2));
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
  ctx.font = 'bold 1.5em Helvetica, Arial';
  var text = options[index]
  ctx.fillText(text, rSizeHalf - ctx.measureText(text).width / 2, rSizeHalf + 10);
  ctx.restore();
}

function easeOut(t, b, c, d) {
  var ts = (t /= d) * t;
  var tc = ts * t;
  return b + c * (tc + -3 * ts + 3 * t);
}

init();
drawRouletteWheel();