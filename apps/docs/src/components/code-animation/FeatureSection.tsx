import { CheckCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { CodeAnimation } from "./CodeAnimation";

const Battery = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="flex flex-col items-center lg:flex-row gap-3">
      <div className="flex gap-1 items-center text-[#9FCA56]">
        <span>Ready</span>
        <CheckCircleIcon size={24} weight="fill" className="" />
      </div>
      <h2 className="font-medium text-nowrap">{title}:</h2>
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
  // const { ref } = useIntersectionObserver({
  //   rootMargin: "-100px 0px -200px 0px",
  //   threshold: 0.5,
  //   name: name,
  // });
  return (
    <button type="button" onClick={() => onClick(name)} className={`text-left cursor-pointer group  ${className}`}>
      <h2
        className={`text-2xl lg:text-4xl font-bold text-balance mb-2 group-hover:text-secondary-foreground ${active && "text-secondary-foreground"}`}
      >
        {title}
      </h2>
      <p className="text-muted-foreground text-lg text-pretty">{description}</p>
    </button>
  );
};

export const FeatureSection = () => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  return (
    <section
      className="pt-20 lg:pb-80 pb-36 pl-6 pr-6 lg:pr-0 lg:pl-20 container mx-auto flex flex-col lg:flex-row lg:gap-20 gap-36"
      id="features"
    >
      <div className="lg:min-w-md space-y-20 lg:space-y-60 lg:pt-60">
        <FeatureTitle
          title="Convention-based file routing."
          description="With Next.js-style patterns."
          name="file-routing"
          onClick={setSelectedFeature}
          active={selectedFeature === "file-routing"}
        />
        <FeatureTitle
          title="Integrated schema validation."
          description="Using Zod with automatic type inference."
          name="schema-validation"
          onClick={setSelectedFeature}
          active={selectedFeature === "schema-validation"}
        />
        <FeatureTitle
          title="Automatic OpenAPI documentation."
          description="Generation from Zod schemas with error response schemas. See Docutopia."
          name="openapi-documentation"
          onClick={setSelectedFeature}
          active={selectedFeature === "openapi-documentation"}
        />
        <div className="lg:pb-2 lg:pt-20">
          <h2 className="text-2xl lg:text-4xl font-bold text-balance mb-2">Batteries included.</h2>
          <p className="text-muted-foreground text-lg text-pretty">Everything you need, ready out of the box.</p>
        </div>
      </div>
      <div className="w-full flex flex-col gap-14">
        <div className="relative flex-1 hidden lg:block">
          <CodeAnimation selectedFeature={selectedFeature} />
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
