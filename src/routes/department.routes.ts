import express from 'express';
import { DepartmentController } from '../controllers/department.controller';

const router = express.Router();

router.post('/', DepartmentController.createDepartment);

export default router;
