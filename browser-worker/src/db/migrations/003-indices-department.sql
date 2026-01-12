-- 1. 系所與年級的基礎組合索引
CREATE INDEX idx_dept_grade ON courses(semester, departmentID, grade);

-- 2. 系所/年級下的時間表查詢 (完整時間、僅結束時間、僅開始時間)
CREATE INDEX idx_dept_grade_day_period ON courses(semester, departmentID, grade, dayNum, startPeriod, endPeriod);
CREATE INDEX idx_dept_grade_day_start ON courses(semester, departmentID, grade, dayNum, startPeriod);
CREATE INDEX idx_dept_grade_day_end ON courses(semester, departmentID, grade, dayNum, endPeriod);

-- 3. 針對「不分年級」但「指定系所」的查詢優化
CREATE INDEX idx_dept ON courses(semester, departmentID);
CREATE INDEX idx_dept_day ON courses(semester, departmentID, dayNum);
CREATE INDEX idx_dept_day_start ON courses(semester, departmentID, dayNum, startPeriod);