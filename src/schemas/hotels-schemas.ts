import Joi from 'joi';
import { HotelIdParams } from '@/protocols';

export const HotelIdParamsSchema = Joi.object<HotelIdParams>({
  id: Joi.number().required(),
});
