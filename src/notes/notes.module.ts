import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from '../models/note.schema';
import { NotesController } from './notes.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }])],
  controllers: [NotesController],
  providers: [],
  exports: [],
})
export class NotesModule {}
