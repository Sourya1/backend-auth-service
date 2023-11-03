export type ErrorResponseFormat = {
  body: { errors: [{ msg: string }] };
  statusCode: number;
};

export interface Headers {
  ['set-cookie']: string[];
}
