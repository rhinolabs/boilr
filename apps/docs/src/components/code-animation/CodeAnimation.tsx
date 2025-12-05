import { FileTsIcon, FolderSimpleIcon } from "@phosphor-icons/react";
import { Pre, highlight } from "codehike/code";
import type { AnnotationHandler, HighlightedCode, RawCode } from "codehike/code";
import { type ReactNode, useEffect, useState } from "react";
import { files } from "./data";
import { focus } from "./handlers/Focus";
import { lineNumbers } from "./handlers/LineNumbers";

const FolderNav = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex gap-2 items-center py-1">
      <FolderSimpleIcon size={24} weight="fill" className="text-muted-foreground" />
      <span>{children}</span>
    </div>
  );
};

const FileNav = ({
  children,
  methods,
  onClick,
  active,
}: { children: ReactNode; methods?: string[]; onClick?: () => void; active?: boolean }) => {
  return (
    <button
      type="button"
      className={`flex items-center  justify-between gap-12 py-1  rounded-md px-1 w-full cursor-pointer min-w-[150px] transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-secondary hover:text-secondary-foreground"}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 ">
        <FileTsIcon
          size={24}
          weight="fill"
          className={`${active ? "text-accent" : "text-[#0288D1]"} transition-colors`}
        />
        <span>{children}</span>
      </div>
      <div className="flex">
        {methods?.map((method) => (
          <span
            key={method}
            className="text-emerald-600 border border-emerald-600 rounded-full px-2 pb-0.5 py-1.5 text-xs leading-none font-epilogue"
          >
            {method}
          </span>
        ))}
      </div>
    </button>
  );
};

const NavIndentation = ({ children }: { children: ReactNode }) => {
  return (
    <div className="pl-3">
      <div className="pl-1.5 border-l border-border space-y-1">{children}</div>
    </div>
  );
};

export const CodeAnimation = ({ selectedFeature }: { selectedFeature: string | null }) => {
  const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("users/[id].ts");
  const [handlers, setHandlers] = useState<AnnotationHandler[]>([]);

  useEffect(() => {
    highlight(
      {
        lang: "ts",
        meta: "",
        value: files.find((file) => file.name === selectedFileName)?.code || "",
      },
      "github-dark",
    ).then(setHighlighted);
  }, [selectedFileName]);

  useEffect(() => {
    switch (selectedFeature) {
      case "schema-validation":
        if (selectedFileName === "src/server.ts") {
          setSelectedFileName("users/[id].ts");
        }
        setHandlers([focus]);
        break;
      case "openapi-documentation":
        setSelectedFileName("src/server.ts");
        setHandlers([focus]);
        break;
      default:
        setHandlers([]);
        break;
    }
  }, [selectedFeature, selectedFileName]);

  if (!highlighted) {
    return null;
  }
  return (
    <div className="sticky top-20 self-start max-w-5xl border border-border rounded-md  bg-background max-h-[60vh] w-full aspect-video flex">
      <div
        className={`flex flex-col p-3 rounded-s-md border pr-5  ${selectedFeature === "file-routing" ? "bg-secondary border-secondary-foreground " : "border-transparent"}`}
      >
        <FolderNav>src</FolderNav>
        <NavIndentation>
          <FolderNav>routes</FolderNav>
          <NavIndentation>
            <FolderNav>api</FolderNav>
            <NavIndentation>
              <FolderNav>users</FolderNav>
              <NavIndentation>
                <FileNav
                  onClick={() => setSelectedFileName("users/[id].ts")}
                  active={selectedFileName === "users/[id].ts"}
                >
                  [id].ts
                </FileNav>
                <FileNav
                  onClick={() => setSelectedFileName("users/index.ts")}
                  active={selectedFileName === "users/index.ts"}
                >
                  index.ts
                </FileNav>
              </NavIndentation>
              <FileNav onClick={() => setSelectedFileName("api/index.ts")} active={selectedFileName === "api/index.ts"}>
                index.ts
              </FileNav>
            </NavIndentation>
            <FolderNav>(admin)</FolderNav>
            <NavIndentation>
              <FileNav
                onClick={() => setSelectedFileName("(admin)/settings.ts")}
                active={selectedFileName === "(admin)/settings.ts"}
              >
                settings.ts
              </FileNav>
            </NavIndentation>
            <FileNav
              onClick={() => setSelectedFileName("routes/[...catchAll].ts")}
              active={selectedFileName === "routes/[...catchAll].ts"}
            >
              [...catchAll].ts
            </FileNav>
          </NavIndentation>
          <FileNav onClick={() => setSelectedFileName("src/server.ts")} active={selectedFileName === "src/server.ts"}>
            server.ts
          </FileNav>
        </NavIndentation>
      </div>
      <div className="p-3 flex-1 w-full overflow-auto h-full scrollbar-thin bg-zinc-600/10 rounded-sm">
        <div className="p-1">
          <Pre code={highlighted} handlers={[lineNumbers, ...handlers]} />
        </div>
      </div>
    </div>
  );
};
