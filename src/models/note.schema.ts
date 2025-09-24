import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Note extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId!: Types.ObjectId;

  @Prop({ required: true })
  matiere!: string;

  @Prop({ required: true })
  note!: number;

  @Prop({})
  remarques?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  formateurId!: Types.ObjectId;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
// Indexes to speed up common queries
NoteSchema.index({ studentId: 1 });
NoteSchema.index({ formateurId: 1 });
NoteSchema.index({ matiere: 1 });