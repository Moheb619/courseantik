import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const el = useRef();
  const location = useLocation();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.current,
        {
          opacity: 0,
          y: 20,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
      );
    }, el);

    return () => ctx.revert();
  }, [location.pathname]); // Re-run when path changes

  return (
    <div ref={el} className="w-full h-full">
      {children}
    </div>
  );
};

export default PageTransition;
