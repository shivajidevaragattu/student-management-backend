import { Request, Response } from 'express';
import db from '../db';
import { departmentsTable } from '../db/schema';

export class DepartmentController {
  static async createDepartment(req: Request, res: Response) {
    try {
      const { code, name } = req.body;
      if (!code || !name) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      const response = await db
        .insert(departmentsTable)
        .values({
          code,
          name,
        })
        .returning();

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        departmentId: response[0].id,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          'Something went wrong at DepartmentController.createDepartment',
        error,
      });
    }
  }
}
