import React from "react";
import type {  ChatModel  } from "../types/chat.types";

interface Props {
  models: ChatModel[];
  selectedModel: string;
  onSelect: (modelId: string) => void;
}

const ModelSelector: React.FC<Props> = ({ models, selectedModel, onSelect }) => {
  return (
    <div className="model-selector">
      {models.map((model) => (
        <button
          key={model.id}
          className={`model-tab${model.id === selectedModel ? " active" : ""}`}
          onClick={() => onSelect(model.id)}
        >
          {model.label}
        </button>
      ))}
    </div>
  );
};

export default ModelSelector;
