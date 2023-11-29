import { checkSchema } from 'express-validator';

export default checkSchema({
  name: {
    errorMessage: 'name is a required',
    notEmpty: true,
    trim: true,
    isLength: {
      options: { min: 5 },
      errorMessage: 'Name should be 5 char long',
    },
  },
  address: {
    errorMessage: 'address is a required',
    notEmpty: true,
    trim: true,
  },
});
