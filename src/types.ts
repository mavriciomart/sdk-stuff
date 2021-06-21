export type ConfigOptions = {
  host;
  schemaUrl: string;
  authEndpoint?: string;
};

type ParameterSchema = {
  maxLength: number;
  minLength: number;
  pattern: RegExp;
  type: "string" | string;
};

type OperationParameter = {
  description: string;
  in: "path" | string;
  name: string;
  required: boolean;
  schema: ParameterSchema;
};

type Operation = {
  operationId: string;
  parameters: OperationParameter[];
  responses: Record<number, { description: string }>;
  summary: string;
  tags: string[];
};

type HTTPMethod = "delete" | "get" | "patch" | "post" | "put";
type Path = Record<HTTPMethod, Operation>;
export type SchemaPaths = Record<string, Path>;
export type RequestMethods = "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
