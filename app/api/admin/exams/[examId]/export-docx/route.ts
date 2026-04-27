import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { promises as fs } from "node:fs"
import path from "node:path"
import os from "node:os"

const execFileAsync = promisify(execFile)

// 로컬 개발 환경 전용: 시험을 Word(.docx)로 내보내기
// Pandoc 바이너리가 필요하므로 Vercel 배포 환경에서는 동작하지 않음
export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "로컬 개발 환경에서만 사용할 수 있습니다." },
      { status: 404 }
    )
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인 필요" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 })
  }

  const { examId: examIdStr } = await params
  const examId = parseInt(examIdStr, 10)
  if (Number.isNaN(examId)) {
    return NextResponse.json({ error: "잘못된 시험 ID" }, { status: 400 })
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { name: true, year: true, round: true },
  })
  if (!exam) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const noAnswers = searchParams.get("noAnswers") === "1"
  const noImages = searchParams.get("noImages") === "1"
  const withExplanation = searchParams.get("withExplanation") === "1"

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "exam-export-"))
  const outPath = path.join(tmpDir, "export.docx")

  const args = [
    "scripts/export-exam-to-docx.py",
    "--exam-id",
    String(examId),
    "--out",
    outPath,
  ]
  if (noAnswers) args.push("--no-answers")
  if (noImages) args.push("--no-images")
  if (withExplanation) args.push("--with-explanation")

  try {
    await execFileAsync("python", args, {
      cwd: process.cwd(),
      maxBuffer: 50 * 1024 * 1024,
      timeout: 120_000,
    })
  } catch (e: unknown) {
    const err = e as { stderr?: string; stdout?: string; message?: string }
    console.error("[export-docx] error:", err.stderr || err.message)
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
    return NextResponse.json(
      {
        error: "변환 실패",
        detail: err.stderr || err.stdout || err.message || "unknown",
      },
      { status: 500 }
    )
  }

  const buf = await fs.readFile(outPath)
  await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})

  const safe = (s: string) =>
    s.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_")
  const titleParts = [
    exam.year ? String(exam.year) : "",
    exam.round ? `${exam.round}회` : "",
    exam.name,
  ].filter(Boolean)
  const filename =
    safe(titleParts.join("_")).replace(/^_+|_+$/g, "") + ".docx"

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  })
}
