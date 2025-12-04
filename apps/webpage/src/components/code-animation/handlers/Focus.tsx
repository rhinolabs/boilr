import { useLayoutEffect, useRef } from "react";
import { type AnnotationHandler, InnerLine, InnerPre, getPreRef } from "codehike/code";

export const PreWithFocus: AnnotationHandler["PreWithRef"] = (props) => {
  const ref = getPreRef(props);
  useScrollToFocus(ref);
  return <InnerPre merge={props} />;
};

function useScrollToFocus(ref: React.RefObject<HTMLPreElement>) {
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (ref.current) {
      // find all descendants whith data-focus="true"
      const focusedElements = ref.current.querySelectorAll("[data-focus=true]") as NodeListOf<HTMLElement>;

      // find top and bottom of the focused elements
      const containerRect = ref.current.getBoundingClientRect();
      let top = Number.POSITIVE_INFINITY;
      let bottom = Number.NEGATIVE_INFINITY;
      // biome-ignore lint/complexity/noForEach: <explanation>
      focusedElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        top = Math.min(top, rect.top - containerRect.top);
        bottom = Math.max(bottom, rect.bottom - containerRect.top);
      });

      // scroll to the focused elements if any part of them is not visible
      if (bottom > containerRect.height || top < 0) {
        ref.current.scrollTo({
          top: ref.current.scrollTop + top - 10,
          behavior: firstRender.current ? "instant" : "smooth",
        });
      }
      firstRender.current = false;
    }
  });
}

export const focus: AnnotationHandler = {
  name: "focus",
  onlyIfAnnotated: true,
  PreWithRef: PreWithFocus,
  Line: (props) => <InnerLine merge={props} className="opacity-50 data-focus:opacity-100 px-2" />,
  AnnotatedLine: ({ annotation, ...props }) => <InnerLine merge={props} data-focus={true} className="bg-zinc-700/30" />,
};
