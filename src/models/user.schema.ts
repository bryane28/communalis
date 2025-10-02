import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true }) nom!: string;
  @Prop({ required: true }) prenom!: string;
  @Prop({ unique: true, required: true }) email!: string;
  @Prop({ required: true }) motDePasse!: string;
  @Prop({ enum: ['admin', 'formateur', 'parent'],required: true }) role!: string;
  @Prop() telephone?: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }] }) studentIds?: Types.ObjectId[];
  @Prop() avatarUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);