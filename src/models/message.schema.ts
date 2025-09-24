import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId!: Types.ObjectId;

  @Prop({ required: true })
  content!: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
// Indexes to speed up common queries
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ receiverId: 1 });