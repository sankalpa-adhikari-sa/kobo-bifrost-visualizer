import { useRef, useState, useEffect } from "react";
import {
  Tldraw,
  TLComponents,
  useEditor,
  useValue,
  stopEventPropagation,
} from "tldraw";
import "tldraw/tldraw.css";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info, Lock, Eye, AlertCircle } from "lucide-react";
import { useTldrawSurveyInput } from "@/components/useTldrawSurveyInput";

export default function TldrawComponent() {
  const editorRef = useRef(null);
  const { shapes, bindings } = useTldrawSurveyInput();
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    if (isEditorReady && shapes?.length) {
      const editor = editorRef.current;
      if (editor) {
        editor.createShapes(shapes);
        if (bindings?.length) {
          editor.createBindings(bindings);
        }
        editor.selectAll();
      }
    }
  }, [shapes, bindings, isEditorReady]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    setIsEditorReady(true);
  };

  const hasMetaContent = (meta) => {
    if (!meta) return false;
    return Object.keys(meta).some(
      (key) =>
        meta[key] && typeof meta[key] === "string" && meta[key].trim() !== "",
    );
  };
  const MetadataSection = ({ title, children, icon }) => {
    if (!children) return null;
    return (
      <div className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
        <div className="flex items-center gap-2 mb-1.5">
          {icon}
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        </div>
        {children}
      </div>
    );
  };

  const MetadataField = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="ml-6 mb-1.5 last:mb-0">
        <div className="text-xs">
          <span className="text-gray-500">{label}: </span>
          <span className="text-gray-900">{value}</span>
        </div>
      </div>
    );
  };

  const components: TLComponents = {
    InFrontOfTheCanvas: () => {
      const editor = useEditor();

      const info = useValue(
        "selection bounds",
        () => {
          const screenBounds = editor.getViewportScreenBounds();
          const rotation = editor.getSelectionRotation();
          const rotatedScreenBounds = editor.getSelectionRotatedScreenBounds();
          const selectedShape = editor.getOnlySelectedShape();

          if (!rotatedScreenBounds) return null;

          return {
            x: rotatedScreenBounds.x - screenBounds.x,
            y: rotatedScreenBounds.y - screenBounds.y,
            width: rotatedScreenBounds.width,
            height: rotatedScreenBounds.height,
            rotation: rotation,
            meta: selectedShape?.meta,
          };
        },
        [editor],
      );

      if (!info || !hasMetaContent(info.meta)) return null;

      return (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "top left",
            transform: `translate(${info.x}px, ${info.y}px) rotate(${info.rotation}rad)`,
            pointerEvents: "all",
          }}
          onPointerDown={stopEventPropagation}
        >
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 border shadow-sm transition-colors hover:bg-white cursor-help">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-96">
              <div className="space-y-3">
                <MetadataSection
                  title="Basic Information"
                  icon={<Info className="w-4 h-4 text-blue-500" />}
                >
                  <MetadataField label="Label" value={info.meta.label} />
                  <MetadataField label="Hint" value={info.meta.hint} />
                  <MetadataField label="Note" value={info.meta.note} />
                </MetadataSection>

                <MetadataSection
                  title="Validation"
                  icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
                >
                  <MetadataField
                    label="Constraint"
                    value={info.meta.constraint}
                  />
                  <MetadataField
                    label="Constraint Message"
                    value={info.meta.constraintMessage}
                  />
                  <MetadataField label="Required" value={info.meta.required} />
                  <MetadataField
                    label="Required Message"
                    value={info.meta.requiredMessage}
                  />
                </MetadataSection>

                <MetadataSection
                  title="Behavior"
                  icon={<Lock className="w-4 h-4 text-gray-500" />}
                >
                  <MetadataField label="Read Only" value={info.meta.readonly} />
                  <MetadataField
                    label="Default Value"
                    value={info.meta.defaultValue}
                  />
                  <MetadataField label="Relevant" value={info.meta.relevant} />
                </MetadataSection>

                <MetadataSection
                  title="Guidance"
                  icon={<Eye className="w-4 h-4 text-green-500" />}
                >
                  <MetadataField
                    label="Guidance Hint"
                    value={info.meta.guidanceHint}
                  />
                  <MetadataField
                    label="Appearance"
                    value={info.meta.appearance}
                  />
                </MetadataSection>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      );
    },
  };

  return (
    <div className="absolute inset-0 mt-[90px]">
      <Tldraw
        persistenceKey="xlsform"
        onMount={handleMount}
        components={components}
      />
    </div>
  );
}
