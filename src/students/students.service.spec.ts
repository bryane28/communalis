import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentsService } from './students.service';
import { Student } from '../models/student.schema';
import { User } from '../models/user.schema';
import { QueryStudentDto } from './DTO/query-student.dto';

function chainQuery<T>(result: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
  } as any;
}

describe('StudentsService', () => {
  let service: StudentsService;
  let studentModel: jest.Mocked<Model<Student>>;
  let userModel: jest.Mocked<Model<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getModelToken(Student.name),
          useValue: {
            find: jest.fn(),
            countDocuments: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn().mockReturnThis(),
            select: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    studentModel = module.get(getModelToken(Student.name));
    userModel = module.get(getModelToken(User.name));
  });

  describe('findAll', () => {
    it('should return paginated students with role filtering (formateur)', async () => {
      const query: QueryStudentDto = { page: 1, limit: 2, nom: 'Al' } as any;
      const currentUser = { userId: 'FORM1', role: 'formateur' };
      const fakeStudents = [{ _id: 's1' }] as any;

      (studentModel.find as jest.Mock).mockReturnValue(chainQuery(fakeStudents));
      (studentModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const res = await service.findAll(query, currentUser);

      expect(res.data).toEqual(fakeStudents);
      expect(res.meta).toEqual({ page: 1, limit: 2, total: 1, totalPages: 1 });
      // Le filtre doit contenir formateurId = currentUser.userId
      expect(studentModel.find).toHaveBeenCalledWith({
        nom: { $regex: 'Al', $options: 'i' },
        formateurId: 'FORM1',
      });
    });
  });

  describe('create', () => {
    it('should create student', async () => {
      const dto = { nom: 'Alice' } as any;
      const created = { _id: 's1', nom: 'Alice' } as any;
      (studentModel.create as jest.Mock).mockResolvedValue(created);
      const res = await service.create(dto);
      expect(res).toBe(created);
      expect(studentModel.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('assignFormateur', () => {
    it('should set formateur if valid', async () => {
      (userModel.findById as jest.Mock).mockResolvedValue({ role: 'formateur' });
      const updated = { _id: 's1', formateurId: 'F1' } as any;
      (studentModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);
      const res = await service.assignFormateur('s1', 'F1');
      expect(res).toBe(updated);
    });
  });

  describe('assignParent', () => {
    it('should set parent and push student id to parent.studentIds if not exists', async () => {
      const parent: any = { role: 'parent', studentIds: [], save: jest.fn() };
      (userModel.findById as jest.Mock).mockResolvedValue(parent);
      const student: any = { _id: 's1' };
      (studentModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(student);

      const res = await service.assignParent('s1', 'P1');
      expect(res).toBe(student);
      expect(parent.save).toHaveBeenCalled();
    });
  });
});
