import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from '../models/student.schema';
import { User } from '../models/user.schema';
import { QueryStudentDto } from './DTO/query-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findAll(query: QueryStudentDto, currentUser?: { userId: string; role: string }) {
    const { page = 1, limit = 10, sortBy, sortOrder = 'asc', nom, prenom, formateurId, parentId } = query;
    const filter: Record<string, any> = {};

    if (nom) filter.nom = { $regex: nom, $options: 'i' };
    if (prenom) filter.prenom = { $regex: prenom, $options: 'i' };
    if (formateurId) filter.formateurId = formateurId;
    if (parentId) filter.parentId = parentId;

    // Règles d'accès par rôle
    if (currentUser) {
      if (currentUser.role === 'formateur') {
        filter.formateurId = currentUser.userId;
      } else if (currentUser.role === 'parent') {
        filter.parentId = currentUser.userId;
      }
    }

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

  async assignFormateur(studentId: string, formateurId: string) {
    const formateur = await this.userModel.findById(formateurId);
    if (!formateur || formateur.role !== 'formateur') {
      throw new Error('Le formateur spécifié est invalide');
    }
    const student = await this.studentModel.findByIdAndUpdate(
      studentId,
      { formateurId },
      { new: true },
    );
    return student;
  }

  async assignParent(studentId: string, parentId: string) {
    const parent = await this.userModel.findById(parentId);
    if (!parent || parent.role !== 'parent') {
      throw new Error('Le parent spécifié est invalide');
    }
    const student = await this.studentModel.findByIdAndUpdate(
      studentId,
      { parentId },
      { new: true },
    );
    if (student) {
      // Ajouter l'élève à la liste du parent s'il n'y est pas déjà
      const pid = (student._id as any).toString();
      const current = (parent.studentIds || []).map((x: any) => x.toString());
      if (!current.includes(pid)) {
        parent.studentIds = [...(parent.studentIds || []), student._id as any];
        await parent.save();
      }
    }
    return student;
  }
}
