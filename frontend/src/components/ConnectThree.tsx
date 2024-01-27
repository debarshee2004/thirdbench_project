"use client";

import React, { useEffect } from "react";
import gsap from "gsap";

/**
 * The ConnectThree component is a React functional component that renders an animated background
 * using the GSAP library. It creates a canvas animation with moving points and lines.
 *
 * The animation is responsive and adapts to window resize and mouse movement events.
 *
 * @returns JSX element representing the ConnectThree component.
 */
const ConnectThree: React.FC = () => {
  /**
   * The useEffect hook initializes and controls the animation lifecycle. It sets up event listeners
   * for mouse movement, scroll, and window resize. Additionally, it initializes the animation and
   * circles when the component mounts.
   */
  useEffect(() => {
    let width: number, height: number;
    let largeHeader: HTMLElement | null,
      canvas: HTMLCanvasElement | null,
      ctx: CanvasRenderingContext2D | null,
      points: any[],
      target: any,
      animateHeader: boolean;

    initHeader();
    initAnimation();
    addListeners();

    /**
     * Initializes the header, canvas, and points for the animation.
     */
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

      points = [];
      for (let x = 0; x < width; x = x + width / 20) {
        for (let y = 0; y < height; y = y + height / 20) {
          const px = x + Math.random() * (width / 20);
          const py = y + Math.random() * (height / 20);
          const p = { x: px, originX: px, y: py, originY: py };
          points.push(p);
        }
      }

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

      for (let i in points) {
        const c = new Circle(
          points[i],
          2 + Math.random() * 4,
          "rgba(255,255,255,0.8)"
        );
        points[i].circle = c;
      }
    }

    /**
     * Adds event listeners for mouse movement, scroll, and window resize.
     */
    function addListeners() {
      if (!("ontouchstart" in window)) {
        window.addEventListener("mousemove", mouseMove);
      }
      window.addEventListener("scroll", scrollCheck);
      window.addEventListener("resize", resize);
    }

    /**
     * Updates the target coordinates based on mouse movement.
     * @param {MouseEvent} e - The mouse movement event.
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
     * Checks the scroll position to determine whether to animate the header.
     */
    function scrollCheck() {
      if (document.body.scrollTop > height) animateHeader = true;
      else animateHeader = true;
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (largeHeader) largeHeader.style.height = height + "px";
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    /**
     * Initializes the animation by calling the animate function and shifting points.
     */
    function initAnimation() {
      animate();
      for (let i in points) {
        shiftPoint(points[i]);
      }
    }

    /**
     * The main animation loop that clears the canvas and draws points and lines based on mouse
     * proximity.
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
     * Shifts the position of a point using GSAP animation.
     * @param {any} p - The point object to be shifted.
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

    /**
     * Draws lines between active points on the canvas.
     * @param {any} p - The point object for which to draw lines.
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
     * Represents a circle object with a position, radius, and color.
     * @param {Object} pos - The position object with x and y coordinates.
     * @param {number} rad - The radius of the circle.
     * @param {string} color - The fill color of the circle.
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

    /**
     * Calculates the Euclidean distance between two points.
     * @param {any} p1 - The first point.
     * @param {any} p2 - The second point.
     * @returns {number} The Euclidean distance between the two points.
     */
    function getDistance(p1: any, p2: any) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
  }, []);

  return (
    <>
      <div id="large-header" className="large-header">
        <canvas id="demo-canvas"></canvas>
        <div className="main-title">
          <h1 className="text-8xl">
            <span className="thin">The</span> Third{" "}
            <span className="thin">Bench</span>
          </h1>
          <p>Presents</p>
        </div>
      </div>
    </>
  );
};

export default ConnectThree;
