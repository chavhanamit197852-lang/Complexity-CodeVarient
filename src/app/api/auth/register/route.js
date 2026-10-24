
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { registerSchema } from '@/lib/validators';
import { createSession } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    await connectDB();

    const email = data.email.trim().toLowerCase();

    const exists = await User.findOne({ email });

    if (exists) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'ALREADY_EXISTS',
            message: 'Email already in use',
          },
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      name: data.name.trim(),
      email,
      passwordHash,
    });

    await createSession(user._id.toString());

    return Response.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    // Show the actual error in the development terminal.
    console.error('[REGISTER_ERROR]', err);

    if (err instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: err.issues?.[0]?.message || 'Invalid registration data',
          },
        },
        { status: 400 }
      );
    }

    // Handle duplicate email race conditions.
    if (err?.code === 11000) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'ALREADY_EXISTS',
            message: 'Email already in use',
          },
        },
        { status: 409 }
      );
    }

    return Response.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message:
            process.env.NODE_ENV === 'development'
              ? err.message
              : 'Registration failed',
        },
      },
      { status: 500 }
    );
  }
}
