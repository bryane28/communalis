import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from '../models/note.schema';
import { User } from '../models/user.schema';
import { QueryNoteDto } from './DTO/query-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<Note>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findAll(query: QueryNoteDto, currentUser?: { userId: string; role: string }) {
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

    // Règles d'accès par rôle
    if (currentUser) {
      if (currentUser.role === 'formateur') {
        filter.formateurId = currentUser.userId;
      } else if (currentUser.role === 'parent') {
        // Charger la liste des élèves liés à ce parent
        const parent = await this.userModel.findById(currentUser.userId).select('studentIds');
        const sids = (parent?.studentIds || []).map((id: any) => id.toString());
        // Si pas d'élèves, retourner vide rapidement
        if (sids.length === 0) {
          return {
            data: [],
            meta: { page, limit, total: 0, totalPages: 0 },
          };
        }
        filter.studentId = { $in: sids };
      }
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
