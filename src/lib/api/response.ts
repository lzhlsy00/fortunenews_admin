import { NextResponse } from 'next/server';

type ValidationError = {
  field: string;
  message: string;
};

type SuccessBody<T> = {
  success: true;
  data: T;
  message?: string;
};

type ErrorBody = {
  success: false;
  message: string;
  errors?: ValidationError[];
};

export const successResponse = <T>(data: T, init?: ResponseInit & { message?: string }) => {
  const { message, ...responseInit } = init ?? {};
  const body: SuccessBody<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };

  return NextResponse.json(body, responseInit);
};

export const successMessage = (message: string, init?: ResponseInit) => {
  return NextResponse.json({ success: true, message }, init);
};

export const errorResponse = (message: string, options?: { status?: number; errors?: ValidationError[] }) => {
  const { status = 500, errors } = options ?? {};
  const body: ErrorBody = {
    success: false,
    message,
    ...(errors?.length ? { errors } : {}),
  };

  return NextResponse.json(body, { status });
};
