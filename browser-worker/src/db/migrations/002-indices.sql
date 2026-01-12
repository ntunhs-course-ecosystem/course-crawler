-- 1. 建立基本查詢索引
CREATE INDEX idx_semester_name ON courses(semester, courseName);
CREATE INDEX idx_semester_day_period_start_end ON courses(semester, dayNum, startPeriod, endPeriod);
CREATE INDEX idx_semester_day_period_start ON courses(semester, dayNum, startPeriod);
CREATE INDEX idx_semester_day_period_end ON courses(semester, dayNum, endPeriod);

-- 2. 加上 grade 的索引組合
CREATE INDEX idx_semester_grade_name ON courses(semester, grade, courseName);
CREATE INDEX idx_semester_grade_day_period_start_end ON courses(semester, grade, dayNum, startPeriod, endPeriod);
CREATE INDEX idx_semester_grade_day_period_start ON courses(semester, grade, dayNum, startPeriod);
CREATE INDEX idx_semester_grade_day_period_end ON courses(semester, grade, dayNum, endPeriod);