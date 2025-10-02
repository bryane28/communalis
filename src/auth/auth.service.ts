import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user.schema';
import { OTP } from '../models/otp.schema';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(OTP.name) private otpModel: Model<OTP>,
    private jwtService: JwtService,
    private readonly config: ConfigService,
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

  async requestOtp(email: string) {
    // Optionnel: vérifier que l'utilisateur existe
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Aucun utilisateur avec cet email');

    const code = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6 chiffres
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Supprimer d'anciens OTP pour cet email
    await this.otpModel.deleteMany({ email });
    await this.otpModel.create({ email, code, expiresAt });

    // Envoi email si SMTP est configuré
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const userSmtp = this.config.get<string>('SMTP_USER');
    const passSmtp = this.config.get<string>('SMTP_PASS');
    const from = this.config.get<string>('SMTP_FROM');

    if (host && port && userSmtp && passSmtp && from) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port: Number(port),
          secure: Number(port) === 465, // true pour 465, false sinon
          auth: { user: userSmtp, pass: passSmtp },
        });
        await transporter.sendMail({
          from,
          to: email,
          subject: 'Votre code OTP',
          text: `Votre code OTP est: ${code}. Il expire dans 10 minutes.`,
          html: `<p>Votre code OTP est: <b>${code}</b></p><p>Il expire dans 10 minutes.</p>`,
        });
      } catch (err) {
        // Ne pas échouer la requête si l'email ne part pas
        console.warn('Envoi OTP par email échoué:', (err as Error).message);
      }
    }

    // Pour l'instant, retourner aussi le code pour faciliter les tests manuels
    return { message: 'OTP généré', email, code, expiresAt };
  }

  async verifyOtp(email: string, code: string) {
    const record = await this.otpModel.findOne({ email, code });
    if (!record) throw new UnauthorizedException('OTP invalide');
    if (record.expiresAt.getTime() < Date.now()) {
      await record.deleteOne();
      throw new UnauthorizedException('OTP expiré');
    }
    // Option: invalider l'OTP après usage
    await record.deleteOne();
    return { message: 'OTP validé' };
  }

  async resetPassword(email: string, code: string, nouveauMotDePasse: string) {
    // Vérifier OTP
    const record = await this.otpModel.findOne({ email, code });
    if (!record) throw new UnauthorizedException('OTP invalide');
    if (record.expiresAt.getTime() < Date.now()) {
      await record.deleteOne();
      throw new UnauthorizedException('OTP expiré');
    }

    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    const hash = await bcrypt.hash(nouveauMotDePasse, 10);
    user.motDePasse = hash as any;
    await user.save();
    await record.deleteOne();
    return { message: 'Mot de passe réinitialisé' };
  }

  // -------- Two-step registration flow --------
  async initiateRegister(dto: { nom: string; prenom: string; email: string }) {
    const { email, nom, prenom } = dto;
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new ConflictException('Email déjà utilisé');
    // Envoie l'OTP à l'email fourni
    const result = await this.requestOtp(email);
    return { message: 'OTP envoyé pour inscription', email: result.email, expiresAt: result.expiresAt };
  }

  async completeRegister(dto: {
    nom: string;
    prenom: string;
    email: string;
    code: string;
    motDePasse: string;
    role: string;
    telephone?: string;
  }) {
    const { email, code, motDePasse, nom, prenom, role, telephone } = dto;
    // Vérifie OTP (supprime l'OTP après validation)
    await this.verifyOtp(email, code);

    // Double check: email non utilisé
    const exists = await this.userModel.findOne({ email });
    if (exists) throw new ConflictException('Email déjà utilisé');

    const hash = await bcrypt.hash(motDePasse, 10);
    const user = await this.userModel.create({ nom, prenom, email, motDePasse: hash, role, telephone });
    return { message: 'Inscription complétée', user: { ...user.toObject(), motDePasse: undefined } };
  }
}
