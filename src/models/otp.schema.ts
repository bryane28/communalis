import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class OTP extends Document {
  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  code!: string;

  @Prop({ required: true, expires: 600 })
  expiresAt!: Date;
}

export const OTPSchema = SchemaFactory.createForClass(OTP);