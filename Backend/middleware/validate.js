import Joi from 'joi';

// Reject with a generic message so validation failures don't leak schema details.
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).json({ success: false, message: 'Invalid request data' });
  }
  req.body = value;
  next();
};

const email = Joi.string().email().max(254).required();
const objectId = Joi.string().hex().length(24).required();

export const registerSchema = validate(Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email,
  password: Joi.string().min(8).max(128).required(),
}));

export const loginSchema = validate(Joi.object({
  email,
  password: Joi.string().min(1).max(128).required(),
}));

export const adminLoginSchema = validate(Joi.object({
  email,
  password: Joi.string().min(1).max(128).required(),
}));

export const myOrdersSchema = validate(Joi.object({
  userEmail: Joi.string().email().max(254).optional(),
}));

const orderItemSchema = Joi.object({
  productId: objectId,
  quantity: Joi.number().integer().min(1).max(99).required(),
  size: Joi.string().max(20).allow('').optional(),
});

export const orderCreateSchema = validate(Joi.object({
  orderData: Joi.object({
    orderId: Joi.string().max(100).optional(),
    items: Joi.array().items(orderItemSchema).min(1).max(100).required(),
    customer: Joi.object({
      fullName: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().max(254).required(),
      phone: Joi.string().max(30).required(),
      address: Joi.string().max(300).required(),
      city: Joi.string().max(100).required(),
      zipCode: Joi.string().max(20).required(),
    }).required(),
    paymentMethod: Joi.string().valid('cod', 'card', 'khalti', 'esewa').required(),
    date: Joi.string().max(20).optional(),
  }).required(),
  userEmail: Joi.string().email().max(254).optional(),
}));

const cartItemSchema = Joi.object({
  productId: Joi.string().max(100).required(),
  quantity: Joi.number().integer().min(0).max(99).required(),
  size: Joi.string().max(20).allow('').optional(),
}).unknown(true); // allow rich client fields (name/image/...) without trusting them

export const cartUpdateSchema = validate(Joi.object({
  userId: objectId,
  cartData: Joi.array().items(cartItemSchema).max(100).required(),
}));

export const cartGetSchema = validate(Joi.object({
  userId: objectId,
}));

export const cartClearSchema = validate(Joi.object({
  userId: objectId,
}));
