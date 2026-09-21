import { createRoot } from "react-dom/client";

import { Hello } from "@/components/hello";

const root = document.querySelector("#root");

if (root) createRoot(root).render(<Hello name="world" />);
