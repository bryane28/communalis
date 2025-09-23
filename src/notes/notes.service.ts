import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from '../models/note.schema';
import { QueryNoteDto } from './DTO/query-note.dto';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

  async findAll(query: QueryNoteDto) {
    const { page = 1, limit = 10, sortBy, sortOrder = 'asc', studentId, matiere, minNote, maxNote, formateurId } = query;
    const filter: Record<string, any> = {};

    if (studentId) filter.studentId = studentId;
    if (matiere) filter.matiere = { $regex: matiere, $options: 'i' };
    if (formateurId) filter.formateurId = formateurId;
    if (minNote !== undefined || maxNote !== undefined) {
      filter.note = {};
      if (minNote !== undefined) filter.note.$gte = minNote;
      if (maxNote !== undefined) filter.note.$lte = maxNote;
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.noteModel.find(filter).sort(sort).skip(skip).limit(limit),
      this.noteModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.noteModel.findById(id);
  }

  async create(dto: any) {
    return this.noteModel.create(dto);
  }

  async update(id: string, dto: any) {
    return this.noteModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async delete(id: string) {
    return this.noteModel.findByIdAndDelete(id);
  }
}
