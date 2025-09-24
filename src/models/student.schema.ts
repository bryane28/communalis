import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Student extends Document {
  @Prop({ required: true })
  nom!: string;

  @Prop({ required: true })
  prenom!: string;

  @Prop({ required: true })
  age!: number;

  @Prop({ unique: true, required: true })
  matricule!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  formateurId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  parentId?: Types.ObjectId;

  @Prop({})
  remarques?: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
// Indexes to speed up common queries
StudentSchema.index({ formateurId: 1 });
StudentSchema.index({ parentId: 1 });
StudentSchema.index({ matricule: 1 }, { unique: true });