import { useEffect, useRef, useState } from "react";
import { CodeAnimation } from "./CodeAnimation";
import { useInView } from "motion/react";
import type { AnnotationHandler } from "codehike/code";
import { focus } from "./handlers/Focus";

const Battery = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="flex flex-col lg:items-center lg:flex-row gap-3">
      {/* <div className="flex gap-1 items-center text-[#9FCA56]">
        <span>Ready</span>
        <CheckCircleIcon size={24} weight="fill" className="" />
      </div> */}
      <h2 className="font-medium text-nowrap">{title}</h2>
      <p className="text-muted-foreground text-pretty">{description}</p>
    </div>
  );
};

const FeatureTitle = ({
  title,
  description,
  name,
  className,
  onClick,
  active,
}: {
  title: string;
  description: string;
  name: string;
  className?: string;
  onClick: (name: string) => void;
  active: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prevIsInView = useRef(false);
  const isInView = useInView(ref, {
    amount: "all",
    // when in center of viewport
    margin: "0px 0px -40% 0px",
  });

  useEffect(() => {
    if (isInView && !prevIsInView.current) {
      onClick(name);
    }

    prevIsInView.current = isInView;
  }, [isInView, name, onClick]);

  return (
    <div ref={ref} className={`${className}`}>
      <h2 className={`text-2xl lg:text-4xl font-bold text-balance mb-2 ${active && "text-secondary-foreground"}`}>
        {title}
      </h2>
      <p className="text-muted-foreground text-lg text-pretty">{description}</p>
    </div>
  );
};

export const FeatureSection = () => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("users/[id].ts");
  const [handlers, setHandlers] = useState<AnnotationHandler[]>([]);

  const onChangeSelectedFeature = (feature: string | null) => {
    setSelectedFeature(feature);
    switch (feature) {
      case "schema-validation":
        if (selectedFileName === "src/server.ts") {
          onChangeSelectedFile("users/[id].ts");
        }
        setHandlers([focus]);
        break;
      case "openapi-documentation":
        onChangeSelectedFile("src/server.ts");
        setHandlers([focus]);
        break;
      default:
        setHandlers([]);
        break;
    }
  };
  const onChangeSelectedFile = (fileName: string) => {
    setSelectedFileName(fileName);
  };

  return (
    <section
      className="pt-20 pb-36 px-6 lg:px-0 container mx-auto lg:grid flex flex-col lg:grid-cols-3 lg:gap-20 gap-36"
      id="features"
    >
      <div className="lg:min-w-md space-y-20 lg:space-y-60 lg:pt-60">
        <FeatureTitle
          title="Convention-based file routing."
          description="With Next.js-style patterns."
          name="file-routing"
          onClick={onChangeSelectedFeature}
          active={selectedFeature === "file-routing"}
        />
        <FeatureTitle
          title="Integrated schema validation."
          description="Using Zod with automatic type inference."
          name="schema-validation"
          onClick={onChangeSelectedFeature}
          active={selectedFeature === "schema-validation"}
        />
        <FeatureTitle
          title="Automatic OpenAPI documentation."
          description="Generation from Zod schemas with error response schemas. See Docutopia."
          name="openapi-documentation"
          onClick={onChangeSelectedFeature}
          active={selectedFeature === "openapi-documentation"}
        />
        <div className="lg:pb-2 lg:pt-20">
          <h2 className="text-2xl lg:text-4xl font-bold text-balance mb-2">Batteries included.</h2>
          <p className="text-muted-foreground text-lg text-pretty">Everything you need, ready out of the box.</p>
        </div>
      </div>
      <div className="w-full flex flex-col gap-14 col-span-2 ">
        <div className="relative flex-1 hidden lg:block md:pr-6  pr-0">
          <CodeAnimation
            selectedFeature={selectedFeature}
            handlers={handlers}
            onChangeSelectedFile={onChangeSelectedFile}
            selectedFileName={selectedFileName}
            clearSelectedFeature={() => {
              setSelectedFeature(null);
              setHandlers([]);
            }}
          />
        </div>
        <div className="space-y-12 lg:space-y-4">
          <Battery
            title="Error Handling"
            description="Built-in HTTP exception classes with automatic error formatting and status codes."
          />
          <Battery
            title="Authentication System"
            description="Flexible multi-method authentication with automatic token extraction."
          />
          <Battery
            title="Security and Optimization"
            description="Preconfigured CORS, Helmet, and Rate limiting features."
          />
        </div>
      </div>
    </section>
  );
};
