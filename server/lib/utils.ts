import jwt from "jsonwebtoken";
import { ENV } from "./environments";
import type { WsMessageDataType } from "../types";

type PayloadType = {
  payload: string;
  expiresIn: number | "1h" | "1d" | "7d" | "14d" | "30d" | number;
};

type ResultType = {
  status: "success" | "error";
  message: string;
  data: any;
};

// Sign JWT token
export const signJwtToken = (payload: PayloadType): ResultType => {
  try {
    let result = jwt.sign({ token: payload.payload }, ENV.JWT_SECRET, {
      expiresIn: payload.expiresIn,
    });

    return {
      status: "success",
      message: "Token created successfully",
      data: { token: result },
    };
  } catch (error) {
    return {
      status: "error",
      message: "Token could not be created",
      data: null,
    };
  }
};

// Verify JWT token
export const verifyJwtToken = (token: string): ResultType => {
  try {
    let result = jwt.verify(token, ENV.JWT_SECRET);
    return {
      status: "success",
      message: "Token verified successfully",
      data: result,
    };
  } catch (error) {
    return {
      status: "error",
      message: "Token could not be verified",
      data: null,
    };
  }
};

// Object to json string
export const objToJson = (obj: WsMessageDataType): string =>
  JSON.stringify(obj, null, 2);

// Json string to object
export const jsonToObj = (json: string): WsMessageDataType => JSON.parse(json);
