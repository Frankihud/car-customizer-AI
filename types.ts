
export enum ModificationType {
  COLOR = 'COLOR',
  WHEELS = 'WHEELS',
  BODYKIT = 'BODYKIT',
  VINYL = 'VINYL',
  BACKGROUND = 'BACKGROUND',
}

export interface ModificationOption<T> {
  label: string;
  value: T;
  prompt: string;
  description?: string;
}

export type WheelOption = ModificationOption<string>;
export type BodykitOption = ModificationOption<string>;
export type BackgroundOption = ModificationOption<string>;

export type Modification = {
  type: ModificationType;
  value: string;
  prompt: string;
};

export interface CarView {
  id: string;
  label: string;
  file: File;
}
