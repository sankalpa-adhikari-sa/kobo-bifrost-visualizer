import React, { useRef } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { Button } from "@/components/ui/button.tsx";

export default function TldrawComponent() {
  const editorRef = useRef(null);

  const handleMount = (editor) => {
    editorRef.current = editor;

    editor.createShape({
      type: "text",
      x: 200,
      y: 200,
      props: {
        text: "Hello world!",
      },
    });

    editor.selectAll();
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
