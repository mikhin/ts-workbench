import type { Meta, StoryObj } from "@storybook/react-vite";

import { Hello } from "@/components/hello";

const meta = { args: { name: "World" }, component: Hello } satisfies Meta<typeof Hello>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
