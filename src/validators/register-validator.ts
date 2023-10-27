import { checkSchema } from 'express-validator';

export default checkSchema({
  email: {
    errorMessage: 'Email is required',
    notEmpty: true,
    trim: true,
    isEmail: true,
  },
  firstName: {
    errorMessage: 'firstName is required',
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: 'lastName is required',
    notEmpty: true,
    trim: true,
  },
  password: {
    errorMessage: 'password is required',
    notEmpty: true,
    isLength: {
      errorMessage: 'Password should be at least 7 chars long',
      options: { min: 6 },
    },
  },
});
