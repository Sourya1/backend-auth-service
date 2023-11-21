import { Request } from 'express';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}
export interface ResgisterUserRequest extends Request {
  body: UserData;
}

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
  };
}

export interface IRefreshTokenPayload {
  id: string;
}

export interface ITenent {
  name: string;
  address: string;
}

export interface ITenentRequest extends Request {
  body: ITenent;
}

export interface CreateUserRequest extends Request {
  body: UserData;
}

export interface IUpdatTenentReq extends Request {
  body: ITenent;
}
