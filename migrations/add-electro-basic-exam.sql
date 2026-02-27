-- ============================================================
-- 전기기초 시험 추가 마이그레이션
-- Supabase SQL Editor에서 실행
-- ============================================================

-- 1. exams 테이블에 sort_order 컬럼 추가
ALTER TABLE exams ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 100;

-- 2. 기존 시험 sort_order 설정
UPDATE exams SET sort_order = 20 WHERE name = '전기기능사';
UPDATE exams SET sort_order = 30 WHERE name = '전기산업기사';
UPDATE exams SET sort_order = 40 WHERE name = '전기기사';

-- 3. "전기기초" 시험 INSERT (PRACTICE, sort_order=10 → 맨 앞)
INSERT INTO exams (name, exam_mode, duration_minutes, sort_order)
VALUES ('전기기초', 'PRACTICE', 60, 10);

-- 4. "전기상식" 과목 INSERT
-- 주의: exam_id는 위 INSERT에서 생성된 값으로 자동 매핑
INSERT INTO subjects (exam_id, name, questions_per_attempt, order_no)
SELECT id, '전기상식', 15, 1
FROM exams WHERE name = '전기기초';
