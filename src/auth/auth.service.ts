import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: any) {
    const { email, motDePasse, ...rest } = dto;
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new ConflictException('Email déjà utilisé');
    const hash = await bcrypt.hash(motDePasse, 10);
    const user = await this.userModel.create({ ...rest, email, motDePasse: hash });
    return { message: 'Inscription réussie', user: { ...user.toObject(), motDePasse: undefined } };
  }

  async login(dto: any) {
    const { email, motDePasse } = dto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Identifiants invalides');
    const valid = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');
    const payload = { sub: user._id, role: user.role };
    const token = this.jwtService.sign(payload);
    return { access_token: token, user: { ...user.toObject(), motDePasse: undefined } };
  }
}
