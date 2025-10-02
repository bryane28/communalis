import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User } from '../models/user.schema';
import { QueryUserDto } from './DTO/query-user.dto';

// Helper to build a chainable query mock that finally resolves to `result`
function chainQuery<T>(result: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
  } as any;
}

describe('UsersService', () => {
  let service: UsersService;
  let model: jest.Mocked<Model<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            countDocuments: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(User.name));
  });

  describe('findAll', () => {
    it('should return paginated users with filters and sorting', async () => {
      const query: QueryUserDto = {
        page: 2,
        limit: 5,
        sortBy: 'nom',
        sortOrder: 'desc',
        nom: 'Du',
        prenom: 'Je',
        email: 'example',
        role: 'formateur',
      } as any;

      const fakeUsers = [{ _id: '1' }, { _id: '2' }] as any;

      // When find is called, return a chainable query resolving to fakeUsers
      (model.find as jest.Mock).mockReturnValue(chainQuery(fakeUsers));
      (model.countDocuments as jest.Mock).mockResolvedValue(42);

      const res = await service.findAll(query);

      // Verify response shape
      expect(res.data).toEqual(fakeUsers);
      expect(res.meta).toEqual({ page: 2, limit: 5, total: 42, totalPages: Math.ceil(42 / 5) });

      // Verify filters passed to find
      expect(model.find).toHaveBeenCalledWith({
        nom: { $regex: 'Du', $options: 'i' },
        prenom: { $regex: 'Je', $options: 'i' },
        email: { $regex: 'example', $options: 'i' },
        role: 'formateur',
      });
    });

    it('should apply defaults when query is empty', async () => {
      const query = {} as QueryUserDto;
      const fakeUsers = [] as any;
      (model.find as jest.Mock).mockReturnValue(chainQuery(fakeUsers));
      (model.countDocuments as jest.Mock).mockResolvedValue(0);

      const res = await service.findAll(query);
      expect(res.data).toEqual([]);
      expect(res.meta).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
    });
  });

  describe('findOne', () => {
    it('should delegate to model.findById', async () => {
      const user = { _id: 'u1' } as any;
      (model.findById as jest.Mock).mockResolvedValue(user);
      const res = await service.findOne('u1');
      expect(res).toBe(user);
      expect(model.findById).toHaveBeenCalledWith('u1');
    });
  });

  describe('create', () => {
    it('should delegate to model.create', async () => {
      const dto = { nom: 'A' } as any;
      const created = { _id: 'x', ...dto } as any;
      (model.create as jest.Mock).mockResolvedValue(created);
      const res = await service.create(dto);
      expect(res).toBe(created);
      expect(model.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to model.findByIdAndUpdate with { new: true }', async () => {
      const dto = { nom: 'B' } as any;
      const updated = { _id: 'u1', nom: 'B' } as any;
      (model.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);
      const res = await service.update('u1', dto);
      expect(res).toBe(updated);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith('u1', dto, { new: true });
    });
  });

  describe('delete', () => {
    it('should delegate to model.findByIdAndDelete', async () => {
      const removed = { _id: 'u1' } as any;
      (model.findByIdAndDelete as jest.Mock).mockResolvedValue(removed);
      const res = await service.delete('u1');
      expect(res).toBe(removed);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('u1');
    });
  });
});
