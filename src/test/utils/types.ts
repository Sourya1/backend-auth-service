export type ErrorResponseFormat = {
  body: { error: [{ msg: string }] };
  statusCode: number;
};

export interface Headers {
  ['set-cookie']: string[];
}
