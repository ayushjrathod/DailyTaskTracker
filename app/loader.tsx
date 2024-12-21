"use client";

export default function Loader() {
  return (
    <>
      <style jsx global>{`
        body {
          background-color: black;
          overflow: hidden;
        }
        div {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0px;
          height: 0px;
          border-radius: 100%;
          opacity: 0;
          border: 5px solid white;
          animation: anim 4s infinite linear;
        }
        @keyframes anim {
          0% {
            opacity: 0;
            width: 0vmin;
            height: 0vmin;
          }
          10% {
            opacity: 0.2;
          }
          100% {
            opacity: 0;
            width: 100vmin;
            height: 100vmin;
          }
        }
        div:nth-child(1) {
          animation-delay: 200ms;
        }
        div:nth-child(2) {
          animation-delay: 400ms;
        }
        div:nth-child(3) {
          animation-delay: 600ms;
        }
        div:nth-child(4) {
          animation-delay: 800ms;
        }
        div:nth-child(5) {
          animation-delay: 1000ms;
        }
        div:nth-child(6) {
          animation-delay: 1200ms;
        }
        div:nth-child(7) {
          animation-delay: 1400ms;
        }
        div:nth-child(8) {
          animation-delay: 1600ms;
        }
        div:nth-child(9) {
          animation-delay: 1800ms;
        }
      `}</style>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </>
  );
}
