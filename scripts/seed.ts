import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcrypt';

import { User, UserSchema } from '../src/models/user.schema';
import { Student, StudentSchema } from '../src/models/student.schema';
import { Note, NoteSchema } from '../src/models/note.schema';
import { Message, MessageSchema } from '../src/models/message.schema';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/communalis';
  console.log(`[seed] Connecting to ${uri}`);
  await mongoose.connect(uri);

  const UserModel = mongoose.model<User>('User', UserSchema);
  const StudentModel = mongoose.model<Student>('Student', StudentSchema);
  const NoteModel = mongoose.model<Note>('Note', NoteSchema);
  const MessageModel = mongoose.model<Message>('Message', MessageSchema);

  try {
    // Upsert helper by email
    const upsertUser = async (payload: Partial<User> & { email: string; motDePasse: string }) => {
      const existing = await UserModel.findOne({ email: payload.email });
      if (existing) return existing;
      const hashed = await bcrypt.hash(payload.motDePasse, 10);
      const created = await UserModel.create({
        nom: payload.nom || 'User',
        prenom: payload.prenom || 'Demo',
        email: payload.email,
        motDePasse: hashed,
        role: payload.role || 'parent',
        telephone: payload.telephone,
      } as any);
      return created;
    };

    // Users
    const admin = await upsertUser({
      nom: 'Admin', prenom: 'User', email: 'admin@example.com', motDePasse: 'Password123', role: 'admin', telephone: '+2250700000000',
    } as any);
    const formateur = await upsertUser({
      nom: 'Martin', prenom: 'Paul', email: 'formateur1@example.com', motDePasse: 'Password123', role: 'formateur', telephone: '+2250700000001',
    } as any);
    const parent = await upsertUser({
      nom: 'Durand', prenom: 'Claire', email: 'parent1@example.com', motDePasse: 'Password123', role: 'parent', telephone: '+2250700000002',
    } as any);

    console.log('[seed] Users:', { admin: admin._id, formateur: formateur._id, parent: parent._id });

    // Student (ensure unique matricule)
    const matricule = 'SEED-MAT-001';
    let student = await StudentModel.findOne({ matricule });
    if (!student) {
      student = await StudentModel.create({
        nom: 'Alice',
        prenom: 'Durand',
        age: 10,
        matricule,
        formateurId: formateur._id as Types.ObjectId,
        parentId: parent._id as Types.ObjectId,
        remarques: 'Élève de démo',
      } as any);
    }
    console.log('[seed] Student:', student._id);

    // Notes
    const notesPayload = [
      { matiere: 'Math', note: 16, remarques: 'Bon travail' },
      { matiere: 'Français', note: 14, remarques: 'Peut mieux faire' },
    ];
    for (const n of notesPayload) {
      const exists = await NoteModel.findOne({ studentId: student._id, matiere: n.matiere });
      if (!exists) {
        await NoteModel.create({
          studentId: student._id as Types.ObjectId,
          matiere: n.matiere,
          note: n.note,
          remarques: n.remarques,
          formateurId: formateur._id as Types.ObjectId,
        } as any);
      }
    }
    console.log('[seed] Notes: ensured for', notesPayload.map(n => n.matiere).join(', '));

    // Messages (between parent and formateur)
    const messagesPayload = [
      { senderId: parent._id, receiverId: formateur._id, content: 'Bonjour, comment se passe la classe ?' },
      { senderId: formateur._id, receiverId: parent._id, content: 'Bonjour, Alice progresse très bien.' },
    ];
    for (const m of messagesPayload) {
      const exists = await MessageModel.findOne({ senderId: m.senderId, receiverId: m.receiverId, content: m.content });
      if (!exists) {
        await MessageModel.create(m as any);
      }
    }
    console.log('[seed] Messages inserted/ensured');

    console.log('[seed] Done.');
  } catch (e) {
    console.error('[seed] Error:', e);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
