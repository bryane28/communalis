import { ApiProperty } from '@nestjs/swagger';
import { MetaDoc } from './common.doc';
import { UserDoc } from './user.doc';
import { StudentDoc } from './student.doc';
import { NoteDoc } from './note.doc';
import { MessageDoc } from './message.doc';

class PaginatedBase<T> {
  @ApiProperty({ description: 'Liste paginée' })
  data!: T[];

  @ApiProperty({ type: () => MetaDoc })
  meta!: MetaDoc;
}

export class PaginatedUserDoc extends PaginatedBase<UserDoc> {
  @ApiProperty({ type: () => [UserDoc] })
  override data!: UserDoc[];
}

export class PaginatedStudentDoc extends PaginatedBase<StudentDoc> {
  @ApiProperty({ type: () => [StudentDoc] })
  override data!: StudentDoc[];
}

export class PaginatedNoteDoc extends PaginatedBase<NoteDoc> {
  @ApiProperty({ type: () => [NoteDoc] })
  override data!: NoteDoc[];
}

export class PaginatedMessageDoc extends PaginatedBase<MessageDoc> {
  @ApiProperty({ type: () => [MessageDoc] })
  override data!: MessageDoc[];
}
