import React from "react";

export interface NavLink {
  id: number;
  url: string;
  text: string;
  icon: React.ReactElement;
}

export const links: NavLink[] = [
  {
    id: 1,
    url: "/",
    text: "Home",
    icon: <img src="/HomeButton.png" alt="Home" />,
  },
  {
    id: 2,
    url: "/chat",
    text: "Arya's Space",
    icon: <img src="/ChatButton.png" alt="Chat" />,
  },
  {
    id: 3,
    url: "/roadmap",
    text: "Roadmap",
    icon: <img src="/RoadMapButton.png" alt="Roadmap" />,
  },
  {
    id: 4,
    url: "/solo",
    text: "Solo Code 1vs1",
    icon: <img src="/SoloButton.png" alt="Solo Code" />,
  },
  {
    id: 5,
    url: "/editor",
    text: "Code Editor",
    icon: <img src="/EditorButton.png" alt="Code Editor" />,
  },
  {
    id: 6,
    url: "/interview",
    text: "Mock Interview",
    icon: <img src="/InterViewButton.png" alt="Mock Interview" />,
  },
];
