import greenBottomLeft from "url:./assets/GreenBubble/bottomLeft.png";
import greenBottomMiddle from "url:./assets/GreenBubble/bottomMiddle.png";
import greenBottomRight from "url:./assets/GreenBubble/bottomRight.png";
import greenLeftMiddle from "url:./assets/GreenBubble/leftMiddle.png";
import greenMiddle from "url:./assets/GreenBubble/middle.png";
import greenRightMiddle from "url:./assets/GreenBubble/rightMiddle.png";
import greenTopLeft from "url:./assets/GreenBubble/topLeft.png";
import greenTopMiddle from "url:./assets/GreenBubble/topMiddle.png";
import greenTopRight from "url:./assets/GreenBubble/topRight.png";

import greyBottomLeft from "url:./assets/GreyBubble/bottomLeft.png";
import greyBottomMiddle from "url:./assets/GreyBubble/bottomMiddle.png";
import greyBottomRight from "url:./assets/GreyBubble/bottomRight.png";
import greyLeftMiddle from "url:./assets/GreyBubble/leftMiddle.png";
import greyMiddle from "url:./assets/GreyBubble/middle.png";
import greyRightMiddle from "url:./assets/GreyBubble/rightMiddle.png";
import greyTopLeft from "url:./assets/GreyBubble/topLeft.png";
import greyTopMiddle from "url:./assets/GreyBubble/topMiddle.png";
import greyTopRight from "url:./assets/GreyBubble/topRight.png";

import topBar from "url:./assets/TopBar.png";
import bottomBar from "url:./assets/BottomBar.png";
import background from "url:./assets/Background.png";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
window.ctx = ctx;

const promises = new Set();
const images = {};

for (const data of [
  {
    name: "GreenBubble",
    urls: {
      bottomLeft: greenBottomLeft,
      bottomMiddle: greenBottomMiddle,
      bottomRight: greenBottomRight,
      leftMiddle: greenLeftMiddle,
      middle: greenMiddle,
      rightMiddle: greenRightMiddle,
      topLeft: greenTopLeft,
      topMiddle: greenTopMiddle,
      topRight: greenTopRight,
    },
  },
  {
    name: "GreyBubble",
    urls: {
      bottomLeft: greyBottomLeft,
      bottomMiddle: greyBottomMiddle,
      bottomRight: greyBottomRight,
      leftMiddle: greyLeftMiddle,
      middle: greyMiddle,
      rightMiddle: greyRightMiddle,
      topLeft: greyTopLeft,
      topMiddle: greyTopMiddle,
      topRight: greyTopRight,
    },
  },
]) {
  const type = data.name;
  images[type] = {};
  const urls = data.urls;
  for (const chunk in urls) {
    loadImage(chunk, images[type], urls[chunk]);
  }
}

console.log(images);

loadImage("TopBar", images, topBar);
loadImage("BottomBar", images, bottomBar);
loadImage("Background", images, background);

function loadImage(name, obj, url) {
  const img = new Image();
  img.src = url;
  obj[name] = img;
  promises.add(
    new Promise((res, rej) => {
      img.addEventListener("load", res);
      img.addEventListener("error", rej);
    })
  );
}

const load = Promise.all(promises);

function wrapMeasure(input) {
  ctx.font = "20px Arial";
  const MAX_WIDTH =
    282 - images.GreenBubble.topLeft.width - images.GreenBubble.topRight.width;
  const marginBottom = 6;
  const individualHeight = 12 + marginBottom;

  const text = [];
  const words = input.split(" ");
  let tmp = "";
  let height = 0;
  let width = 0;
  let lastMetrics = null;
  for (const word of words) {
    const newlines = word.split("\n");
    for (const newlineIndex in newlines) {
      const word = newlines[newlineIndex];
      const old = tmp;
      tmp += (tmp.length ? " " : "") + word;
      const metrics = ctx.measureText(tmp);
      if (metrics.width > MAX_WIDTH || newlineIndex > 0) {
        height += Math.max(
          metrics.actualBoundingBoxAscent /*+ marginBottom*/,
          individualHeight
        );
        tmp = word;
        text.push(old);
      } else {
        if (metrics.width > width) {
          width = metrics.width;
        }
        lastMetrics = metrics;
      }
    }
  }

  console.log(width, lastMetrics.width);
  height += marginBottom;

  text.push(tmp);

  return {
    individualHeight,
    height,
    width,
    text,
  };
}

async function drawBubbles(title, bubbles) {
  let x = 0;
  let y = 0;
  console.log("Loading");
  await load;
  console.log("Loaded assets");

  const bubbleMarginBottom = 4;
  const marginBottom = bubbleMarginBottom;

  // Layout phase
  canvas.height = images.TopBar.height + marginBottom;
  canvas.height += images.BottomBar.height + marginBottom;

  for (const bubble of bubbles) {
    const assets = images[bubble.type];
    const metrics = wrapMeasure(bubble.text);
    const textHeight = Math.max(
      0,
      metrics.height - assets.topRight.height * 0.2
    );
    console.log("text height", textHeight);

    const minWidth =
      metrics.width + assets.topLeft.width + assets.topRight.width;
    const minHeight =
      textHeight +
      assets.topLeft.height +
      assets.bottomLeft.height +
      bubbleMarginBottom;
    console.log(
      textHeight,
      assets.topLeft.height,
      assets.bottomLeft.height,
      bubbleMarginBottom
    );

    if (canvas.width < x + minWidth) {
      canvas.width = x + minWidth;
    }
    canvas.height += minHeight;
  }
  if (canvas.width < x + images.TopBar.width) {
    canvas.width = x + images.TopBar.width;
  }

  // Draw phase
  ctx.drawImage(images.TopBar, x, y);
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#ffffff";
  const metrics = ctx.measureText(title);

  ctx.fillText(
    title,
    images.TopBar.width / 2 - metrics.width / 2,
    images.TopBar.height / 2 + metrics.actualBoundingBoxAscent / 2
  );
  ctx.fillStyle = "#000000";
  y += images.TopBar.height;

  for (let i = 0; i < canvas.height; ++i) {
    ctx.drawImage(images.Background, x, y + i);
  }
  y += marginBottom;

  ctx.drawImage(images.BottomBar, x, canvas.height - images.BottomBar.height);

  for (const bubble of bubbles) {
    const assets = images[bubble.type];
    const metrics = wrapMeasure(bubble.text);
    const textHeight = Math.max(
      0,
      metrics.height - assets.topRight.height * 0.3
    );

    const bubbleWidth =
      metrics.width + assets.topLeft.width + assets.bottomRight.width;
    const initialX = x;
    const startX =
      bubble.type == "GreyBubble" ? x : canvas.width - x - bubbleWidth;
    const topX =
      bubble.type == "GreyBubble"
        ? assets.bottomLeft.width - assets.topLeft.width
        : startX;
    x = topX;
    const startY = y;
    ctx.drawImage(assets.topLeft, x, y);
    x += assets.topLeft.width;
    ctx.drawImage(
      assets.topMiddle,
      x,
      y,
      metrics.width,
      assets.topMiddle.height
    );
    x += metrics.width;
    ctx.drawImage(assets.topRight, x, y);
    x += assets.topRight.width;

    y += assets.topLeft.height;

    // Next line
    x = topX;

    ctx.drawImage(assets.leftMiddle, x, y, assets.leftMiddle.width, textHeight);
    x += assets.leftMiddle.width;

    console.log(textHeight, "textHeight");
    ctx.drawImage(assets.middle, x, y, metrics.width, textHeight);
    const textX = x;
    const textY = y + 6;
    x += metrics.width;
    ctx.drawImage(
      assets.rightMiddle,
      x,
      y,
      assets.rightMiddle.width,
      textHeight
    );

    x = startX;

    y += textHeight;
    console.log(x, y, metrics);
    // Bottom
    ctx.drawImage(assets.bottomLeft, x, y);
    x += assets.bottomLeft.width;

    ctx.drawImage(
      assets.bottomMiddle,
      x,
      y,
      metrics.width,
      assets.bottomMiddle.height
    );
    x += metrics.width;

    ctx.drawImage(assets.bottomRight, x, y);
    x += assets.bottomRight.width;
    y += assets.bottomLeft.height;

    let tmpY = textY;
    for (const line of metrics.text) {
      ctx.fillText(line, textX, tmpY);
      tmpY += metrics.individualHeight;
      console.log(ctx.measureText(line).width);
    }
    x = initialX;
    y += bubbleMarginBottom;
  }
}
const titleInput = document.getElementById("title");
const chatInput = document.getElementById("chat");
let bubbles = [];
let title = "";
function onChat() {
  bubbles = [];
  const value = Array.from(chatInput.value);

  function flush(index) {
    if (index > 0) {
      console.log(
        "Flushing out",
        chatInput.value,
        startIndex,
        index,
        chatInput.value.substring(startIndex, index)
      );
      bubbles.push({
        type,
        text: chatInput.value.substring(startIndex, index).trim(),
      });
    }
  }

  let startIndex = 0;
  let type = null;
  for (let index = 0; index < value.length; ++index) {
    const char = value[index];
    if (index == 0 || value[index - 1] == "\n") {
      if (char == ">") {
        flush(index - 1);
        startIndex = index + 1;
        type = "GreenBubble";
      } else if (char == "<") {
        flush(index - 1);
        startIndex = index + 1;
        type = "GreyBubble";
      }
    }
  }
  if (type) {
    flush(value.length);
  }
  console.log(bubbles);
  drawBubbles(title, bubbles);
}
chatInput.addEventListener("change", () => {
  onChat();
});
chatInput.addEventListener("keyup", () => {
  onChat();
});
titleInput.addEventListener("change", () => {
  onTitle();
});
titleInput.addEventListener("keyup", () => {
  onTitle();
});
function onTitle() {
  title = titleInput.value;
  drawBubbles(title, bubbles);
}
