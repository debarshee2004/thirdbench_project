"use client";

import React, { useEffect } from "react";
import gsap from "gsap";

const ConnectThree: React.FC = () => {
  useEffect(() => {
    /* These lines are declaring variables with their respective types. */
    let width: number, height: number;
    let largeHeader: HTMLElement | null,
      canvas: HTMLCanvasElement | null,
      ctx: CanvasRenderingContext2D | null,
      points: any[],
      target: any,
      animateHeader: boolean;

    // Main
    initHeader();
    initAnimation();
    addListeners();

    /* The `initHeader()` function is responsible for initializing the header section of the webpage. */
    function initHeader() {
      width = window.innerWidth;
      height = window.innerHeight;
      target = { x: width / 2, y: height / 2 };

      largeHeader = document.getElementById("large-header");
      if (largeHeader) largeHeader.style.height = height + "px";

      canvas = document.getElementById("demo-canvas") as HTMLCanvasElement;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext("2d");
      }

      // create points
      /* The code block is creating an array called `points` and populating it with objects
      representing points on a grid. */
      points = [];
      for (let x = 0; x < width; x = x + width / 20) {
        for (let y = 0; y < height; y = y + height / 20) {
          const px = x + Math.random() * (width / 20);
          const py = y + Math.random() * (height / 20);
          const p = { x: px, originX: px, y: py, originY: py };
          points.push(p);
        }
      }

      // for each point find the 5 closest points
      /* The code block is finding the 5 closest points to each point in the `points` array. */
      for (let i = 0; i < points.length; i++) {
        const closest = [];
        const p1 = points[i];
        for (let j = 0; j < points.length; j++) {
          const p2 = points[j];
          if (!(p1 === p2)) {
            let placed = false;
            for (let k = 0; k < 5; k++) {
              if (!placed) {
                if (closest[k] === undefined) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }

            for (let k = 0; k < 5; k++) {
              if (!placed) {
                if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }
          }
        }
        p1.closest = closest;
      }

      // assign a circle to each point
      /* The code block is iterating over each element in the `points` array and creating a new
      instance of the `Circle` class for each element. The `Circle` constructor takes three
      arguments: the current point (`points[i]`), a random radius between 2 and 6 (`2 +
      Math.random() * 4`), and a color (`"rgba(255,255,255,0.8)"`). The created circle object is
      then assigned to the `circle` property of the current point object (`points[i].circle = c`). */
      for (let i in points) {
        const c = new Circle(
          points[i],
          2 + Math.random() * 4,
          "rgba(255,255,255,0.8)"
        );
        points[i].circle = c;
      }
    }

    // Event handling
    /**
     * The function "addListeners" adds event listeners for mouse movement, scrolling, and window
     * resizing.
     */
    function addListeners() {
      if (!("ontouchstart" in window)) {
        window.addEventListener("mousemove", mouseMove);
      }
      window.addEventListener("scroll", scrollCheck);
      window.addEventListener("resize", resize);
    }

    /**
     * The function captures the mouse position and updates the target's x and y coordinates
     * accordingly.
     * @param {MouseEvent} e - The parameter "e" is of type MouseEvent. It represents the event object
     * that is triggered when the mouse moves.
     */
    function mouseMove(e: MouseEvent) {
      let posx = 0,
        posy = 0;
      if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
      } else if (e.clientX || e.clientY) {
        posx =
          e.clientX +
          document.body.scrollLeft +
          document.documentElement.scrollLeft;
        posy =
          e.clientY +
          document.body.scrollTop +
          document.documentElement.scrollTop;
      }
      target.x = posx;
      target.y = posy;
    }

    /**
     * The function checks if the user has scrolled past a certain height and updates the animateHeader
     * variable accordingly.
     */
    function scrollCheck() {
      if (document.body.scrollTop > height) animateHeader = false;
      else animateHeader = true;
    }

    /**
     * The resize function adjusts the height of a large header element and the width and height of a
     * canvas element based on the current window dimensions.
     */
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (largeHeader) largeHeader.style.height = height + "px";
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    // animation
    /**
     * The function "initAnimation" initializes an animation by calling the "animate" function and
     * shifting each point in the "points" array.
     */
    function initAnimation() {
      animate();
      for (let i in points) {
        shiftPoint(points[i]);
      }
    }

    /**
     * The function `animate` is responsible for animating points and drawing lines based on their
     * distance from a target point.
     */
    function animate() {
      if (animateHeader) {
        if (ctx) ctx.clearRect(0, 0, width, height);
        for (let i in points) {
          // detect points in range
          if (Math.abs(getDistance(target, points[i])) < 4000) {
            points[i].active = 0.3;
            points[i].circle.active = 0.6;
          } else if (Math.abs(getDistance(target, points[i])) < 20000) {
            points[i].active = 0.1;
            points[i].circle.active = 0.3;
          } else if (Math.abs(getDistance(target, points[i])) < 40000) {
            points[i].active = 0.02;
            points[i].circle.active = 0.1;
          } else {
            points[i].active = 0;
            points[i].circle.active = 0;
          }

          drawLines(points[i]);
          points[i].circle.draw();
        }
      }
      requestAnimationFrame(animate);
    }

    /**
     * The function `shiftPoint` uses the GSAP library to animate the movement of a point on the x and
     * y axes within a specified range.
     * @param {any} p - The parameter "p" represents an object that contains the properties "originX"
     * and "originY". These properties represent the original x and y coordinates of a point.
     */
    function shiftPoint(p: any) {
      gsap.to(p, 1 + 1 * Math.random(), {
        x: p.originX - 50 + Math.random() * 100,
        y: p.originY - 50 + Math.random() * 100,
        ease: "power2.inOut",
        onComplete: function () {
          shiftPoint(p);
        },
      });
    }

    // Canvas manipulation
    /**
     * The function `drawLines` draws lines between points based on the provided parameters.
     * @param {any} p - The parameter `p` is an object that contains the following properties:
     * @returns If the condition `if (!p.active)` is true, then nothing is being returned. If the
     * condition is false, then the function will execute the for loop and draw lines on the canvas.
     * However, the function itself does not have a return statement, so it does not explicitly return
     * anything.
     */
    function drawLines(p: any) {
      if (!p.active) return;
      if (ctx) {
        for (let i in p.closest) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.closest[i].x, p.closest[i].y);
          ctx.strokeStyle = "rgba(156,217,249," + p.active + ")";
          ctx.stroke();
        }
      }
    }

    /**
     * The Circle function is a constructor for creating circle objects that can be drawn on a canvas.
     * @param {any}  - - `pos`: The position of the circle, represented as an object with `x` and `y`
     * properties.
     * @param {any} pos - The `pos` parameter represents the position of the circle. It is an object
     * that contains the `x` and `y` coordinates of the circle's center.
     * @param {number} rad - The "rad" parameter in the Circle function represents the radius of the
     * circle.
     * @param {string} color - The "color" parameter is a string that represents the color of the
     * circle. It can be any valid CSS color value, such as "red", "#FF0000", or "rgb(255, 0, 0)".
     * @returns The code snippet does not explicitly return anything.
     */
    function Circle(this: any, pos: any, rad: number, color: string) {
      const _this = this;

      // constructor
      (function () {
        _this.pos = pos || null;
        _this.radius = rad || null;
        _this.color = color || null;
      })();

      this.draw = function () {
        if (!_this.active) return;
        if (ctx) {
          ctx.beginPath();
          ctx.arc(
            _this.pos.x,
            _this.pos.y,
            _this.radius,
            0,
            2 * Math.PI,
            false
          );
          ctx.fillStyle = "rgba(156,217,249," + _this.active + ")";
          ctx.fill();
        }
      };
    }

    // Util
    /**
     * The function calculates the distance between two points in a two-dimensional space.
     * @param {any} p1 - The parameter p1 represents the first point, which is an object with
     * properties x and y representing the coordinates of the point.
     * @param {any} p2 - The parameter p2 represents the second point in a two-dimensional coordinate
     * system. It has properties x and y, which represent the x and y coordinates of the point
     * respectively.
     * @returns the squared distance between two points, p1 and p2.
     */
    function getDistance(p1: any, p2: any) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
  }, []); // empty dependency array ensures that useEffect runs only once on component mount

  return (
    <>
      <div id="large-header" className="large-header">
        <canvas id="demo-canvas"></canvas>
        <div className="main-title">
          <h1 className="text-4xl">
            <span className="thin">The</span> Third{" "}
            <span className="thin">Bench</span>
          </h1>
          <p>Presents</p>
        </div>
      </div>
      <div>
        <h1>hello</h1>
        <h1>world</h1>
      </div>
    </>
  );
};

export default ConnectThree;
