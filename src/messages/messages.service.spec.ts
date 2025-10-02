import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessagesService } from './messages.service';
import { Message } from '../models/message.schema';
import { QueryMessageDto } from './DTO/query-message.dto';

function chainQuery<T>(result: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
  } as any;
}

describe('MessagesService', () => {
  let service: MessagesService;
  let messageModel: jest.Mocked<Model<Message>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getModelToken(Message.name),
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

    service = module.get<MessagesService>(MessagesService);
    messageModel = module.get(getModelToken(Message.name));
  });

  describe('findAll', () => {
    it('should filter messages by content and user visibility', async () => {
      const query: QueryMessageDto = { page: 1, limit: 3, content: 'Bonjour' } as any;
      const currentUser = { userId: 'U1', role: 'parent' };
      const fake = [{ _id: 'm1' }] as any;

      (messageModel.find as jest.Mock).mockReturnValue(chainQuery(fake));
      (messageModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const res = await service.findAll(query, currentUser);
      expect(res.data).toEqual(fake);
      expect(res.meta).toEqual({ page: 1, limit: 3, total: 1, totalPages: 1 });
      expect(messageModel.find).toHaveBeenCalledWith({
        content: { $regex: 'Bonjour', $options: 'i' },
        $or: [{ senderId: 'U1' }, { receiverId: 'U1' }],
      });
    });
  });

  it('create should delegate to model.create', async () => {
    const dto = { content: 'Hi' } as any;
    const created = { _id: 'm1', ...dto } as any;
    (messageModel.create as jest.Mock).mockResolvedValue(created);
    const res = await service.create(dto);
    expect(res).toBe(created);
    expect(messageModel.create).toHaveBeenCalledWith(dto);
  });

  it('update should delegate to findByIdAndUpdate', async () => {
    const dto = { content: 'Edited' } as any;
    const updated = { _id: 'm1', ...dto } as any;
    (messageModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updated);
    const res = await service.update('m1', dto);
    expect(res).toBe(updated);
    expect(messageModel.findByIdAndUpdate).toHaveBeenCalledWith('m1', dto, { new: true });
  });

  it('delete should delegate to findByIdAndDelete', async () => {
    const removed = { _id: 'm1' } as any;
    (messageModel.findByIdAndDelete as jest.Mock).mockResolvedValue(removed);
    const res = await service.delete('m1');
    expect(res).toBe(removed);
    expect(messageModel.findByIdAndDelete).toHaveBeenCalledWith('m1');
  });
});
