import { useRef, useState, useEffect } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { Button } from "@/components/ui/button.tsx";
import { useTldrawSurveyInput } from "@/components/useTldrawSurveyInput.tsx";

export default function TldrawComponent() {
  const editorRef = useRef(null);
  const { shapes, bindings } = useTldrawSurveyInput(); // Ensure correct destructuring
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

  const handleShowSelectedShapes = () => {
    const editor = editorRef.current;
    if (editor) {
      console.log("Selected Shapes:", editor.getSelectedShapes());
    }
  };

  return (
    <div className="fixed inset-0 mt-[125px]">
      <Tldraw onMount={handleMount} />
      <Button
        onClick={handleShowSelectedShapes}
        className="absolute bottom-10 left-10"
      >
        Show Selected Shapes
      </Button>
    </div>
  );
}
