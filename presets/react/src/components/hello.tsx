import type { JSX } from "react";

import { greet } from "@/services/greet";

type HelloProps = { name: string };

export const Hello = ({ name }: HelloProps): JSX.Element => <h1>{greet(name)}</h1>;
