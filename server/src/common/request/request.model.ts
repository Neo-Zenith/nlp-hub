import { Request } from "express";

export interface CustomRequest extends Request {
    payload?: {
        [key: string]: any;
    };
}