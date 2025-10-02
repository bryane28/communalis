import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotesService } from './notes.service';
import { Note } from '../models/note.schema';
import { User } from '../models/user.schema';
import { QueryNoteDto } from './DTO/query-note.dto';

function chainQuery<T>(result: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
  } as any;
}

describe('NotesService', () => {
  let service: NotesService;
  let noteModel: jest.Mocked<Model<Note>>;
  let userModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getModelToken(Note.name),
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
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    noteModel = module.get(getModelToken(Note.name));
    userModel = module.get(getModelToken(User.name));
  });

  describe('findAll', () => {
    it('should filter by current formateur', async () => {
      const query: QueryNoteDto = { page: 1, limit: 2, matiere: 'Ma' } as any;
      const currentUser = { userId: 'FORM1', role: 'formateur' };
      const fake = [{ _id: 'n1' }] as any;

      (noteModel.find as jest.Mock).mockReturnValue(chainQuery(fake));
      (noteModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const res = await service.findAll(query, currentUser);
      expect(res.data).toEqual(fake);
      expect(res.meta).toEqual({ page: 1, limit: 2, total: 1, totalPages: 1 });
      expect(noteModel.find).toHaveBeenCalledWith({
        matiere: { $regex: 'Ma', $options: 'i' },
        formateurId: 'FORM1',
      });
    });

    it('should return empty when parent has no students', async () => {
      const query: QueryNoteDto = { page: 1, limit: 10 } as any;
      const currentUser = { userId: 'PAR1', role: 'parent' };

      (userModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ studentIds: [] }),
      });

      const res = await service.findAll(query, currentUser);
      expect(res).toEqual({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
      expect(noteModel.find).not.toHaveBeenCalled();
    });
  });

  it('create should delegate to model.create', async () => {
    const dto = { matiere: 'Math' } as any;
    const created = { _id: 'n1', ...dto } as any;
    (noteModel.create as jest.Mock).mockResolvedValue(created);
    const res = await service.create(dto);
    expect(res).toBe(created);
    expect(noteModel.create).toHaveBeenCalledWith(dto);
  });

  it('update should delegate to findByIdAndUpdate', async () => {
    const dto = { matiere: 'Français' } as any;
    const updated = { _id: 'n1', ...dto } as any;
    (noteModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);
    const res = await service.update('n1', dto);
    expect(res).toBe(updated);
    expect(noteModel.findByIdAndUpdate).toHaveBeenCalledWith('n1', dto, { new: true });
  });

  it('delete should delegate to findByIdAndDelete', async () => {
    const removed = { _id: 'n1' } as any;
    (noteModel.findByIdAndDelete as jest.Mock).mockResolvedValue(removed);
    const res = await service.delete('n1');
    expect(res).toBe(removed);
    expect(noteModel.findByIdAndDelete).toHaveBeenCalledWith('n1');
  });
});
