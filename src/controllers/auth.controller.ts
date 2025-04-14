import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import db from '../db';
import {
  addressTable,
  adminsTable,
  studentsTable,
  usersTable,
} from '../db/schema';
import jwt from 'jsonwebtoken';
import { cookieOptions } from '../lib/constants';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role,
        address,
      } = req.body;

      if (
        !email ||
        !password ||
        !firstName ||
        !lastName ||
        !phoneNumber ||
        !role ||
        !address
      ) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      const { street, city, state, zipCode } = address;
      const { rollNumber, admissionDate, departmentId, employeeId } = req.body;

      const passwordHash = await bcrypt.hash(password, 12);

      const createdUser = await db
        .insert(usersTable)
        .values({
          email,
          passwordHash,
          firstName,
          lastName,
          phoneNumber,
          role,
        })
        .returning();

      if (role == 'admin') {
        await db.insert(adminsTable).values({
          userId: createdUser[0].id,
          employeeId,
        });
      } else if (role == 'student') {
        await db.insert(studentsTable).values({
          userId: createdUser[0].id,
          departmentId,
          rollNumber,
          admissionDate,
        });
      }

      await db.insert(addressTable).values({
        city,
        state,
        street,
        userId: createdUser[0].id,
        zipCode,
      });

      res.status(201).json({
        success: true,
        message: 'User registration successful',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Something went wrong at AuthController.register',
        error,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      const users = await db
        .select()
        .from(usersTable)
        .where(eq(email, usersTable.email));
      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Credentials',
        });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        users[0].passwordHash,
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Credentials',
        });
      }

      const token = jwt.sign(
        {
          userId: users[0].id,
          role: users[0].role,
          email: users[0].email,
        },
        process.env.JWT_SECRET!,
      );

      res.cookie('token', token, cookieOptions);
      res.status(200).json({
        success: true,
        message: 'User login successful',
      });
    } catch (error) {
      res.status(500).json({
        error,
        message: 'Something went wrong at AuthController.login',
        success: false,
      });
    }
  }
}
