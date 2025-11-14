// src/types.ts
export type FieldType = 'text' | 'email' | 'password' | 'number';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
}

export interface GenerateComponentPayload {
  componentName: string;
  fields: FormField[];
  githubPath?: string;
  commitMessage?: string;
}
