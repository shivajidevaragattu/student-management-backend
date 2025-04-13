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
    email: varchar('email', { length: 255 }).notNull(),
    password_hash: varchar('password_hash', { length: 255 }).notNull(),
    first_name: varchar('first_name', { length: 255 }).notNull(),
    last_name: varchar('last_name', { length: 255 }).notNull(),
    phone_number: varchar('phone_number', { length: 10 }).notNull(),
    role: userRole('role').notNull().default('student'),
    ...timestamps,
  },
  (table) => [
    index('users_email_idx').on(table.email),
    index('users_phone_number_idx').on(table.phone_number),
  ],
);

export const addressTable = pgTable('addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  street: varchar('street', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  state: varchar('state', { length: 255 }).notNull(),
  zip_code: varchar('zip_code', { length: 7 }).notNull(),
  user_id: uuid('user_id')
    .references(() => usersTable.id)
    .notNull(),
  ...timestamps,
});

export const adminsTable = pgTable(
  'admins',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employee_id: varchar('employee_id', { length: 255 }).notNull(),
    user_id: uuid('user_id')
      .references(() => usersTable.id)
      .notNull(),
    ...timestamps,
  },
  (table) => [index('admins_employee_id_idx').on(table.employee_id)],
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
    roll_number: varchar('roll_number', { length: 255 }).notNull(),
    admission_date: timestamp('admission_date', { mode: 'string' })
      .notNull()
      .defaultNow(),
    department_id: uuid('department_id')
      .references(() => departmentsTable.id)
      .notNull(),
    user_id: uuid('user_id')
      .references(() => usersTable.id)
      .notNull(),
    ...timestamps,
  },
  (table) => [index('students_roll_number_idx').on(table.roll_number)],
);

export const feesTable = pgTable('fees', {
  id: uuid('id').defaultRandom().primaryKey(),
  amount: decimal('amount', { mode: 'number' }).notNull(),
  academic_year: integer('academic_year').notNull(),
  due_date: timestamp('due_date', { mode: 'string' }).notNull(),
  student_id: uuid('student_id')
    .references(() => studentsTable.id)
    .notNull(),
  ...timestamps,
});

export const feePaymentsTable = pgTable('fee_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  fee_id: uuid('fee_id')
    .references(() => feesTable.id)
    .notNull(),
  amount_paid: decimal('amount_paid', { mode: 'number' }).notNull(),
  status: paymentStatus('status').notNull().default('unpaid'),
  payment_date: timestamp('payment_date', { mode: 'string' })
    .defaultNow()
    .notNull(),
  ...timestamps,
});
