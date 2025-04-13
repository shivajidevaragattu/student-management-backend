import { sql } from 'drizzle-orm';
import {
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now() AT TIME ZONE 'utc'`),
};

export const userRole = pgEnum('user_role', ['admin', 'student']);

export const paymentStatus = pgEnum('payment_status', [
  'paid',
  'unpaid',
  'partial',
]);

export const usersTable = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    phoneNumber: varchar('phone_number', { length: 10 }).notNull(),
    role: userRole('role').notNull().default('student'),
    ...timestamps,
  },
  (table) => [
    index('users_email_idx').on(table.email),
    index('users_phone_number_idx').on(table.phoneNumber),
  ],
);

export const addressTable = pgTable('addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  street: varchar('street', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  state: varchar('state', { length: 255 }).notNull(),
  zipCode: varchar('zip_code', { length: 7 }).notNull(),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timestamps,
});

export const adminsTable = pgTable(
  'admins',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: varchar('employee_id', { length: 255 }).notNull(),
    userId: uuid('user_id')
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    ...timestamps,
  },
  (table) => [index('admins_employee_id_idx').on(table.employeeId)],
);

export const departmentsTable = pgTable(
  'departments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 10 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps,
  },
  (table) => [index('departments_name_idx').on(table.name)],
);

export const studentsTable = pgTable(
  'students',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    rollNumber: varchar('roll_number', { length: 255 }).notNull().unique(),
    admissionDate: timestamp('admission_date', { mode: 'string' })
      .notNull()
      .defaultNow(),
    departmentId: uuid('department_id')
      .references(() => departmentsTable.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    ...timestamps,
  },
  (table) => [index('students_roll_number_idx').on(table.rollNumber)],
);

export const feesTable = pgTable('fees', {
  id: uuid('id').defaultRandom().primaryKey(),
  amount: decimal('amount', { mode: 'number' }).notNull(),
  academicYear: integer('academic_year').notNull(),
  dueDate: timestamp('due_date', { mode: 'string' }).notNull(),
  studentId: uuid('student_id')
    .references(() => studentsTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timestamps,
});

export const feePaymentsTable = pgTable('fee_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  feeId: uuid('fee_id')
    .references(() => feesTable.id, { onDelete: 'cascade' })
    .notNull(),
  amountPaid: decimal('amount_paid', { mode: 'number' }).notNull(),
  status: paymentStatus('status').notNull().default('unpaid'),
  paymentDate: timestamp('payment_date', { mode: 'string' })
    .defaultNow()
    .notNull(),
  ...timestamps,
});
