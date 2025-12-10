import { FileTsIcon, FolderSimpleIcon } from "@phosphor-icons/react";
import { Pre, highlight } from "codehike/code";
import type { AnnotationHandler, HighlightedCode } from "codehike/code";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { type ReactNode, useEffect, useState } from "react";
import { files } from "./data";
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

interface CodeAnimationProps {
  selectedFeature: string | null;
  selectedFileName: string | null;
  handlers: AnnotationHandler[];
  onChangeSelectedFile: (fileName: string) => void;
  clearSelectedFeature: () => void;
}

export const CodeAnimation = ({
  selectedFeature,
  selectedFileName,
  handlers,
  onChangeSelectedFile,
  clearSelectedFeature,
}: CodeAnimationProps) => {
  const [highlighted, setHighlighted] = useState<HighlightedCode | null>(null);

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

  if (!highlighted) {
    return null;
  }
  return (
    <div className="sticky top-20 self-start max-w-5xl border border-border rounded-md  bg-background max-h-[60vh] w-full aspect-video flex">
      <div
        className={`flex flex-col p-3 rounded-s-md border pr-5 transition-colors ${selectedFeature === "file-routing" ? "bg-secondary border-secondary-foreground " : "border-transparent"}`}
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
                  onClick={() => {
                    onChangeSelectedFile("users/[id].ts");
                    clearSelectedFeature();
                  }}
                  active={selectedFileName === "users/[id].ts"}
                >
                  [id].ts
                </FileNav>
                <FileNav
                  onClick={() => {
                    onChangeSelectedFile("users/index.ts");
                    clearSelectedFeature();
                  }}
                  active={selectedFileName === "users/index.ts"}
                >
                  index.ts
                </FileNav>
              </NavIndentation>
              <FileNav
                onClick={() => {
                  onChangeSelectedFile("api/index.ts");
                  clearSelectedFeature();
                }}
                active={selectedFileName === "api/index.ts"}
              >
                index.ts
              </FileNav>
            </NavIndentation>
            <FolderNav>(admin)</FolderNav>
            <NavIndentation>
              <FileNav
                onClick={() => {
                  onChangeSelectedFile("(admin)/settings.ts");
                  clearSelectedFeature();
                }}
                active={selectedFileName === "(admin)/settings.ts"}
              >
                settings.ts
              </FileNav>
            </NavIndentation>
            <FileNav
              onClick={() => {
                onChangeSelectedFile("routes/[...catchAll].ts");
                clearSelectedFeature();
              }}
              active={selectedFileName === "routes/[...catchAll].ts"}
            >
              [...catchAll].ts
            </FileNav>
          </NavIndentation>
          <FileNav
            onClick={() => {
              onChangeSelectedFile("src/server.ts");
              clearSelectedFeature();
            }}
            active={selectedFileName === "src/server.ts"}
          >
            server.ts
          </FileNav>
        </NavIndentation>
      </div>
      <div className="p-3 flex-1 w-full overflow-auto h-full scrollbar-thin bg-zinc-600/10 rounded-sm">
        <AnimatePresence initial={false}>
          <motion.div
            className="p-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15, delay: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0 } }}
            key={highlighted.code}
          >
            <Pre code={highlighted} handlers={[lineNumbers, ...handlers]} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
