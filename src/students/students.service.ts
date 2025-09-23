import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from '../models/student.schema';
import { QueryStudentDto } from './DTO/query-student.dto';

@Injectable()
export class StudentsService {
  constructor(@InjectModel(Student.name) private studentModel: Model<Student>) {}

  async findAll(query: QueryStudentDto) {
    const { page = 1, limit = 10, sortBy, sortOrder = 'asc', nom, prenom, formateurId, parentId } = query;
    const filter: Record<string, any> = {};

    if (nom) filter.nom = { $regex: nom, $options: 'i' };
    if (prenom) filter.prenom = { $regex: prenom, $options: 'i' };
    if (formateurId) filter.formateurId = formateurId;
    if (parentId) filter.parentId = parentId;

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.studentModel.find(filter).sort(sort).skip(skip).limit(limit),
      this.studentModel.countDocuments(filter),
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
    return this.studentModel.findById(id);
  }

  async create(dto: any) {
    return this.studentModel.create(dto);
  }

  async update(id: string, dto: any) {
    return this.studentModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async delete(id: string) {
    return this.studentModel.findByIdAndDelete(id);
  }
}
