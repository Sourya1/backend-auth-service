import { checkSchema } from 'express-validator';

export default checkSchema({
  firstName: {
    errorMessage: 'First name is a required',
    notEmpty: true,
    trim: true,
    isLength: {
      options: { min: 5 },
      errorMessage: 'Name should be 5 char long',
    },
  },
  lastName: {
    errorMessage: 'Last name is a required',
    notEmpty: true,
    trim: true,
  },
  email: {
    errorMessage: 'Email is required',
    isEmail: true,
    trim: true,
    notEmpty: true,
  },
  password: {
    errorMessage: 'Password is required',
    notEmpty: true,
    trim: true,
    isLength: {
      options: {
        min: 6,
      },
      errorMessage: 'Password should be at least 6 char ',
    },
  },
  role: {
    errorMessage: 'Role is Required',
    trim: true,
    notEmpty: true,
  },
  tenentId: {
    errorMessage: 'TenentId is required',
    trim: true,
    isEmpty: true,
  },
});
