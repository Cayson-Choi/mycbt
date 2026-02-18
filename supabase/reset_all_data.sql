-- ============================================
-- 전체 DB 초기화 (데이터만 삭제, 테이블 구조 유지)
-- Supabase Dashboard > SQL Editor에서 실행
-- ============================================

-- 1) 데이터 삭제 (FK 의존 순서: 자식 → 부모)
TRUNCATE
  audit_logs,
  daily_leaderboard_snapshots,
  daily_best_scores,
  subject_scores,
  attempt_items,
  attempt_questions,
  attempts,
  questions,
  subjects,
  exams
CASCADE;

-- 2) 시퀀스(auto increment ID) 리셋
ALTER SEQUENCE exams_id_seq RESTART WITH 1;
ALTER SEQUENCE subjects_id_seq RESTART WITH 1;
ALTER SEQUENCE questions_id_seq RESTART WITH 1;
ALTER SEQUENCE attempts_id_seq RESTART WITH 1;
ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;

-- 3) 시험/과목 기초 데이터 재입력
INSERT INTO exams (id, name) VALUES
  (1, '전기기능사'),
  (2, '전기산업기사'),
  (3, '전기기사');

INSERT INTO subjects (exam_id, name, questions_per_attempt, order_no) VALUES
  (1, '전기이론', 5, 1),
  (1, '전기기기', 5, 2),
  (1, '전기설비', 5, 3);

INSERT INTO subjects (exam_id, name, questions_per_attempt, order_no) VALUES
  (2, '전기자기학', 3, 1),
  (2, '전력공학', 3, 2),
  (2, '전기기기', 3, 3),
  (2, '회로이론', 3, 4),
  (2, '전기설비기술기준', 3, 5);

INSERT INTO subjects (exam_id, name, questions_per_attempt, order_no) VALUES
  (3, '전기자기학', 3, 1),
  (3, '전력공학', 3, 2),
  (3, '전기기기', 3, 3),
  (3, '회로이론 및 제어공학', 3, 4),
  (3, '전기설비기술기준', 3, 5);

SELECT setval('exams_id_seq', (SELECT MAX(id) FROM exams));
SELECT setval('subjects_id_seq', (SELECT MAX(id) FROM subjects));
