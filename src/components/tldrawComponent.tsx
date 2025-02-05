import { useRef, useState, useEffect } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { Button } from "@/components/ui/button.tsx";
import { useTldrawSurveyShapes } from "@/components/useTldrawSurveyShapes.tsx";

export default function TldrawComponent() {
  const editorRef = useRef(null);
  const shapesdata = useTldrawSurveyShapes();
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    if (isEditorReady && shapesdata && shapesdata.length > 0) {
      const editor = editorRef.current;
      editor.createShapes(shapesdata);
      editor.selectAll();
    }
  }, [shapesdata, isEditorReady]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    setIsEditorReady(true);
  };

  const handleShowSelectedShapes = () => {
    const editor = editorRef.current;
    if (editor) {
      const selectedShapes = editor.getSelectedShapes();
      console.log("Selected Shapes:", selectedShapes);
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
