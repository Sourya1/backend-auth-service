import { checkSchema } from 'express-validator';

export default checkSchema({
  email: {
    errorMessage: 'Email is a required',
    notEmpty: true,
    trim: true,
    isEmail: true,
  },
  password: {
    errorMessage: 'password is a required',
    notEmpty: true,
  },
});
