export type Label = { text: string }

type Caption = Label

type Shown = Label

export type { Shown }

export type Heading = Label

export const caption = (label: Caption): string => label.text
