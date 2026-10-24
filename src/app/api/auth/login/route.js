import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { loginSchema } from '@/lib/validators';
import { createSession } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    await connectDB();
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return Response.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) {
      return Response.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }

    await createSession(user._id.toString());
    return Response.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } },
        { status: 400 }
      );
    }
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Login failed' } },
      { status: 500 }
    );
  }
}
