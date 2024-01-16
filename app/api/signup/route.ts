import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, companyId } = await req.json();

    if (!email || !password || !name || !companyId) {
      return NextResponse.json(
        { message: "email, password, name, companyId is required" },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: { email, password: hashedPassword, name, companyId },
    });

    return NextResponse.json({ message: "User registered." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "An error occurred while signup the email",
      },
      { status: 500 }
    );
  }
}
