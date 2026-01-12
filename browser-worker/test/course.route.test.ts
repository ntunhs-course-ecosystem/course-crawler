import { expect, it, describe, beforeAll } from 'vitest';
import { env } from 'cloudflare:workers';
import { SELF, applyD1Migrations } from 'cloudflare:test';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { Database } from '../src/types/database';
import path from 'node:path';
import setupSql from '../src/db/migrations/001-setup.sql?raw';

describe('Course Search API', () => {
	// 初始化一個可以用於測試操作的 Kysely 實例
	let testDb: Kysely<Database>;

	beforeAll(async () => {
		await applyD1Migrations(env.ntunhs_course, [
			{
				name: '001-setup',
				queries: [setupSql],
			},
		]);

		testDb = new Kysely<Database>({
			dialect: new D1Dialect({ database: env.ntunhs_course }),
		});

		// 1. 清除舊資料 (確保測試獨立性)
		await testDb.deleteFrom('courses').execute();

		// 2. 插入測試範例資料
		const testValues = [
			{
				semester: 1122,
				department: '二年制進修部護理系(日間班)',
				courseType: '通識選修(通識)',
				courseFullID: '11230028801370',
				courseName: '休閒與生活',
				courseEngName: 'Leisure and Life',
				departmentID: '11230',
				subjectID: '0288',
				subjectGroup: '01',
				grade: '3',
				classGroup: '70',
				credit: 2,
				className: '護進日二技3年70班',
				classID: '11230370',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 39,
				weekNumber: '第1~14週',
				multipleTeacherName: '吳旻穎',
				note: '1.畢業班14週課程。\n修課限制：本系二技進修部、本系二技一般生、外系二技進修部、本系四技一般生、外系四技一般生、外系二技一般生、畢業班課程。\n本課程安排多次校外教學和戶外活動，欲選修前，請審慎評估自身體力、健康狀況及耐候程度，以確保個人安全。',
				courseAbstract:
					'本課程旨在從學生經由電影休閒活動，引導學生了解更深層生活之中的文化領域，再利用文學閱讀的休閒活動，更進一步進行個人的寫作創作，開發未獲運用的身心組織及功能，更積極地反饋為個人的成長，增進個人身心發展與成熟，進而轉換成品德與自我價值體系。',
				courseEngAbstract:
					'The aim of this course is to guide students explore their culture by watching movies, reading books, and writing novel. To borrow the ideas of the movies, students can  create their own novel. In term of those leisure activities, students can develop their personal growth and create their value system.',
				day: '週一',
				mainTeacherName: '吳旻穎',
				dayNum: 1,
				courseLocation: 'F410',
				startPeriod: 5,
				endPeriod: 7,
				startTime: '12:40',
				endTime: '15:30',
			},
			{
				semester: 1122,
				department: '二年制進修部護理系(日間班)',
				courseType: '通識選修(通識)',
				courseFullID: '11230028301371',
				courseName: '傳播與生活',
				courseEngName: null,
				departmentID: '11230',
				subjectID: '0283',
				subjectGroup: '01',
				grade: '3',
				classGroup: '71',
				credit: 2,
				className: '護進日二技3年71班',
				classID: '11230371',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 50,
				weekNumber: '第1~14週',
				multipleTeacherName: '席代麟',
				note: '1.畢業班14週課程。\n修課限制：本系二技進修部、本系四技一般生、本系二技一般生、外系二技進修部、外系四技一般生、外系二技一般生、畢業班課程',
				courseAbstract: '介紹當代的主要傳播媒介及其與一般民眾日常生活之互動關係。',
				courseEngAbstract: 'To introduce contemporary communication tools and their influence with our lives',
				day: '週一',
				mainTeacherName: '席代麟',
				dayNum: 1,
				courseLocation: 'F607',
				startPeriod: 8,
				endPeriod: 10,
				startTime: '15:40',
				endTime: '18:30',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業選修(系所)',
				courseFullID: '43160012401110',
				courseName: '程式設計',
				courseEngName: 'Introduction of Computer Programming',
				departmentID: '43160',
				subjectID: '0124',
				subjectGroup: '01',
				grade: '1',
				classGroup: '10',
				credit: 2,
				className: '人日碩士1年10班',
				classID: '43160110',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '翁仕彥',
				note: '修課限制：本所、外所、跨校、程式設計課程',
				courseAbstract:
					'本課程將簡介程式設計，其中包括程式語言軟體安裝環境、基本語法、變數與運算、流程控制、字串處理、序對、串列、集合、字典、函數與資料結構、例外處理與檔案處理、類別、資料視覺化等內容，並佐以智慧照護實例進行。',
				courseEngAbstract:
					'This course will introduce programming, including programming language software installation environment, basic syntax, variables and operations, flow control, string processing, sequence pairs, serials, sets, dictionaries, functions and data structures, exception handling and file processing, categories, data visualization, etc., and are supported by smart care examples.',
				day: '週二',
				mainTeacherName: '翁仕彥',
				dayNum: 2,
				courseLocation: 'F906',
				startPeriod: 6,
				endPeriod: 7,
				startTime: '13:40',
				endTime: '15:30',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業選修(系所)',
				courseFullID: '43160187301110',
				courseName: '資料探勘',
				courseEngName: 'Data Mining',
				departmentID: '43160',
				subjectID: '1873',
				subjectGroup: '01',
				grade: '1',
				classGroup: '10',
				credit: 2,
				className: '人日碩士1年10班',
				classID: '43160110',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '楊明仁',
				note: '修課限制：本所、外所、跨校、程式設計課程',

				courseAbstract:
					'你有沒有想過：為什麼Youtube會知道你愛看什麼影片？為什麼便利商店總是剛好賣你需要的東西？其實，這些都是因為「資料探勘」！我們每天都在留下「數位足跡」，而資料探勘就像是偵探一樣，幫我們從一堆資料中找出規律和秘密。這門課，我們會用一套很酷、免寫程式的資料分析軟體 Orange，學會怎麼「看見」資料背後的故事。',
				courseEngAbstract:
					'Have you ever wondered how YouTube always seems to know what videos you’ll enjoy, or why convenience stores always stock exactly what you’re looking for? The answer lies in data mining — the art and science of discovering meaningful patterns hidden within vast amounts of data. Every day, we leave behind a digital footprint, and data mining acts like a detective, uncovering insights and stories buried in the numbers.\nIn this course, you’ll explore the fascinating world of data through Orange, an intuitive, no-coding data analysis tool. Step by step, you’ll learn how to visualize, interpret, and reveal the hidden narratives behind the data that shape our modern lives.',
				day: '週二',
				mainTeacherName: '楊明仁',
				dayNum: 2,
				courseLocation: 'F906',
				startPeriod: 1,
				endPeriod: 2,
				startTime: '08:10',
				endTime: '10:00',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業選修(系所)',
				courseFullID: '43160186601111',
				courseName: '健康科技管理',
				courseEngName: null,
				departmentID: '43160',
				subjectID: '1866',
				subjectGroup: '01',
				grade: '1',
				classGroup: '11',
				credit: 2,
				className: '人日碩士1年11班',
				classID: '43160111',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '謝雨珊',
				note: '修課限制：EMI全英語授課、本所、外所、跨校、程式設計課程',

				courseAbstract: null,
				courseEngAbstract: null,
				day: '週五',
				mainTeacherName: '謝雨珊',
				dayNum: 5,
				courseLocation: 'G308',
				startPeriod: 3,
				endPeriod: 4,
				startTime: '10:10',
				endTime: '12:00',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業選修(系所)',
				courseFullID: '43160012401111',
				courseName: '程式設計',
				courseEngName: 'Introduction of Computer Programming',
				departmentID: '43160',
				subjectID: '0124',
				subjectGroup: '01',
				grade: '1',
				classGroup: '11',
				credit: 2,
				className: '人日碩士1年11班',
				classID: '43160111',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '翁仕彥',
				note: '修課限制：EMI全英語授課、本所、外所、跨校、程式設計課程',

				courseAbstract:
					'本課程將簡介程式設計，其中包括程式語言軟體安裝環境、基本語法、變數與運算、流程控制、字串處理、序對、串列、集合、字典、函數與資料結構、例外處理與檔案處理、類別、資料視覺化等內容，並佐以智慧照護實例進行。',
				courseEngAbstract:
					'This course will introduce programming, including programming language software installation environment, basic syntax, variables and operations, flow control, string processing, sequence pairs, serials, sets, dictionaries, functions and data structures, exception handling and file processing, categories, data visualization, etc., and are supported by smart care examples.',
				day: '週五',
				mainTeacherName: '翁仕彥',
				dayNum: 5,
				courseLocation: 'F906',
				startPeriod: 6,
				endPeriod: 7,
				startTime: '13:40',
				endTime: '15:30',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業選修(系所)',
				courseFullID: '43160187301111',
				courseName: '資料探勘',
				courseEngName: 'Data Mining',
				departmentID: '43160',
				subjectID: '1873',
				subjectGroup: '01',
				grade: '1',
				classGroup: '11',
				credit: 2,
				className: '人日碩士1年11班',
				classID: '43160111',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '蘇和瑞',
				note: '修課限制：EMI全英語授課、本所、外所、跨校、程式設計課程',

				courseAbstract:
					'你有沒有想過：為什麼Youtube會知道你愛看什麼影片？為什麼便利商店總是剛好賣你需要的東西？其實，這些都是因為「資料探勘」！我們每天都在留下「數位足跡」，而資料探勘就像是偵探一樣，幫我們從一堆資料中找出規律和秘密。這門課，我們會用一套很酷、免寫程式的資料分析軟體 Orange，學會怎麼「看見」資料背後的故事。',
				courseEngAbstract:
					'Have you ever wondered how YouTube always seems to know what videos you’ll enjoy, or why convenience stores always stock exactly what you’re looking for? The answer lies in data mining — the art and science of discovering meaningful patterns hidden within vast amounts of data. Every day, we leave behind a digital footprint, and data mining acts like a detective, uncovering insights and stories buried in the numbers.\nIn this course, you’ll explore the fascinating world of data through Orange, an intuitive, no-coding data analysis tool. Step by step, you’ll learn how to visualize, interpret, and reveal the hidden narratives behind the data that shape our modern lives.',
				day: '週一',
				mainTeacherName: '蘇和瑞',
				dayNum: 1,
				courseLocation: 'F906',
				startPeriod: 6,
				endPeriod: 7,
				startTime: '13:40',
				endTime: '15:30',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業必修(系所)',
				courseFullID: '431601861011A0',
				courseName: '健康大數據分析',
				courseEngName: 'Analysis of Big Data in Health',
				departmentID: '43160',
				subjectID: '1861',
				subjectGroup: '01',
				grade: '1',
				classGroup: 'A0',
				credit: 2,
				className: '人日碩士1年A0班',
				classID: '431601A0',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '葉馨婷',
				note: '修課限制：本所、外所、跨校、程式設計課程',

				courseAbstract:
					'本課程旨在提供對健康大數據分析的介紹，擬簡介健康大數據的來\n源及其優劣勢，並瞭解健康大數據之實際應用，並擬進一步使學生習得如何使用健康大數據\n處理資料串連、變項定義、分類分群、描述性統計等基本分析方式。',
				courseEngAbstract:
					'This course aims to provide an introduction to the analysis of big \nhealth data. It intends to briefly introduce the sources of big health data and its \nadvantages and disadvantages, and to understand the practical application of big health \ndata. It is also intended to further enable students to learn how to use big health \ndata to process data concatenation, variable definition, classification and grouping, \ndescriptive statistics and other basic analysis methods.',
				day: '週二',
				mainTeacherName: '葉馨婷',
				dayNum: 2,
				courseLocation: 'F906',
				startPeriod: 3,
				endPeriod: 4,
				startTime: '10:10',
				endTime: '12:00',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業必修(系所)',
				courseFullID: '431601860011A0',
				courseName: '資料科學',
				courseEngName: 'Data Science',
				departmentID: '43160',
				subjectID: '1860',
				subjectGroup: '01',
				grade: '1',
				classGroup: 'A0',
				credit: 2,
				className: '人日碩士1年A0班',
				classID: '431601A0',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '謝楠楨',
				note: '修課限制：本所、外所、跨校、程式設計課程',

				courseAbstract:
					'本課程將介紹資料科學的一些常用的技巧，並透過軟體的操作，讓學生可以理解各資料分析的原理\n及使用，培養學生作中學的能力，並進一步推動學生跨領域結合的思維。',
				courseEngAbstract:
					'This course aims to the introduction of data science technology. \nStudents can learn the theories of data analysis via software. This course can \ncultivate the students the abilities of leaning-by-doing and further enhance the \nstudents’ thought of interdisciplinary.',
				day: '週四',
				mainTeacherName: '謝楠楨',
				dayNum: 4,
				courseLocation: 'F906',
				startPeriod: 8,
				endPeriod: 9,
				startTime: '15:40',
				endTime: '17:30',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業必修(系所)',
				courseFullID: '431601862011A0',
				courseName: '機器學習',
				courseEngName: 'Machine Learning',
				departmentID: '43160',
				subjectID: '1862',
				subjectGroup: '01',
				grade: '1',
				classGroup: 'A0',
				credit: 3,
				className: '人日碩士1年A0班',
				classID: '431601A0',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '郭朝揚',
				note: '修課限制：本所、外所、跨校、程式設計課程',

				courseAbstract:
					'本課程將介紹機器學習的基本理論，並透過軟體的操作，讓學生可以理解各機器學習的原理及使\n用，培養學生的軟體操作能力、機器學習方法的使用，並進一步推動學生跨領域結合的思維。',
				courseEngAbstract:
					'This course incorporates the introduction of healthcare and basic \ntheory of artificial intelligence. Students understand the basic concept of machine \nlearning through software, which can cultivate students’ capacity of machine learning \nand interdisciplinary thinking.',
				day: '週四',
				mainTeacherName: '郭朝揚',
				dayNum: 4,
				courseLocation: 'F906',
				startPeriod: 2,
				endPeriod: 4,
				startTime: '09:10',
				endTime: '12:00',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業必修(系所)',
				courseFullID: '431601861011A1',
				courseName: '健康大數據分析',
				courseEngName: 'Analysis of Big Data in Health',
				departmentID: '43160',
				subjectID: '1861',
				subjectGroup: '01',
				grade: '1',
				classGroup: 'A1',
				credit: 2,
				className: '人日碩士1年A1班',
				classID: '431601A1',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '葉馨婷',
				note: '修課限制：EMI全英語授課、本所、外所、跨校、程式設計課程',

				courseAbstract:
					'本課程旨在提供對健康大數據分析的介紹，擬簡介健康大數據的來\n源及其優劣勢，並瞭解健康大數據之實際應用，並擬進一步使學生習得如何使用健康大數據\n處理資料串連、變項定義、分類分群、描述性統計等基本分析方式。',
				courseEngAbstract:
					'This course aims to provide an introduction to the analysis of big \nhealth data. It intends to briefly introduce the sources of big health data and its \nadvantages and disadvantages, and to understand the practical application of big health \ndata. It is also intended to further enable students to learn how to use big health \ndata to process data concatenation, variable definition, classification and grouping, \ndescriptive statistics and other basic analysis methods.',
				day: '週三',
				mainTeacherName: '葉馨婷',
				dayNum: 3,
				courseLocation: 'F906',
				startPeriod: 3,
				endPeriod: 4,
				startTime: '10:10',
				endTime: '12:00',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業必修(系所)',
				courseFullID: '431601860011A1',
				courseName: '資料科學',
				courseEngName: 'Data Science',
				departmentID: '43160',
				subjectID: '1860',
				subjectGroup: '01',
				grade: '1',
				classGroup: 'A1',
				credit: 2,
				className: '人日碩士1年A1班',
				classID: '431601A1',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '楊明仁',
				note: '修課限制：EMI全英語授課、本所、外所、跨校、程式設計課程',

				courseAbstract:
					'本課程將介紹資料科學的一些常用的技巧，並透過軟體的操作，讓學生可以理解各資料分析的原理\n及使用，培養學生作中學的能力，並進一步推動學生跨領域結合的思維。',
				courseEngAbstract:
					'This course aims to the introduction of data science technology. \nStudents can learn the theories of data analysis via software. This course can \ncultivate the students the abilities of leaning-by-doing and further enhance the \nstudents’ thought of interdisciplinary.',
				day: '週三',
				mainTeacherName: '楊明仁',
				dayNum: 3,
				courseLocation: 'F906',
				startPeriod: 6,
				endPeriod: 7,
				startTime: '13:40',
				endTime: '15:30',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業必修(系所)',
				courseFullID: '431601862011A1',
				courseName: '機器學習',
				courseEngName: 'Machine Learning',
				departmentID: '43160',
				subjectID: '1862',
				subjectGroup: '01',
				grade: '1',
				classGroup: 'A1',
				credit: 3,
				className: '人日碩士1年A1班',
				classID: '431601A1',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '蘇和瑞',
				note: '修課限制：EMI全英語授課、本所、外所、跨校、程式設計課程',

				courseAbstract:
					'本課程將介紹機器學習的基本理論，並透過軟體的操作，讓學生可以理解各機器學習的原理及使\n用，培養學生的軟體操作能力、機器學習方法的使用，並進一步推動學生跨領域結合的思維。',
				courseEngAbstract:
					'This course incorporates the introduction of healthcare and basic \ntheory of artificial intelligence. Students understand the basic concept of machine \nlearning through software, which can cultivate students’ capacity of machine learning \nand interdisciplinary thinking.',
				day: '週一',
				mainTeacherName: '蘇和瑞',
				dayNum: 1,
				courseLocation: 'F906',
				startPeriod: 2,
				endPeriod: 4,
				startTime: '09:10',
				endTime: '12:00',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業選修(系所)',
				courseFullID: '43160186601220',
				courseName: '健康科技管理',
				courseEngName: 'Health Technology Management',
				departmentID: '43160',
				subjectID: '1866',
				subjectGroup: '01',
				grade: '2',
				classGroup: '20',
				credit: 2,
				className: '人日碩士2年20班',
				classID: '43160220',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '謝雨珊',
				note: '修課限制：本所、外所、跨校、程式設計課程',

				courseAbstract:
					'本課程內容第一部分針對健康科技產業的介紹；第二部分科技管理的執行過程、健康科技產業流程管理的運用；第三部分探討健康科技管理如何運用於論文撰寫。',
				courseEngAbstract:
					'The first part of this course introduce the health technology\nindustry; the second part is the application process of technology management and\nthe application of process management in the health technology industry; the third\npart discusses how health technology management is applied to thesis writing.',
				day: '週五',
				mainTeacherName: '謝雨珊',
				dayNum: 5,
				courseLocation: 'G308',
				startPeriod: 6,
				endPeriod: 7,
				startTime: '13:40',
				endTime: '15:30',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業選修(系所)',
				courseFullID: '43160016101220',
				courseName: '專題研究',
				courseEngName: '',
				departmentID: '43160',
				subjectID: '0161',
				subjectGroup: '01',
				grade: '2',
				classGroup: '20',
				credit: 1,
				className: '人日碩士2年20班',
				classID: '43160220',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '',
				note: '修課限制：本所、書面選課、實際上課時間及地點請洽授課教師。',

				courseAbstract: '',
				courseEngAbstract: '',
				day: '週一',
				mainTeacherName: '',
				dayNum: 1,
				courseLocation: 'F906',
				startPeriod: 1,
				endPeriod: 1,
				startTime: '08:10',
				endTime: '09:00',
			},
			{
				semester: 1142,
				department: '人工智慧與健康大數據研究所',
				courseType: '專業必修(系所)',
				courseFullID: '431600300012A0',
				courseName: '碩士論文',
				courseEngName: '',
				departmentID: '43160',
				subjectID: '0300',
				subjectGroup: '01',
				grade: '2',
				classGroup: 'A0',
				credit: 6,
				className: '人日碩士2年A0班',
				classID: '431602A0',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '',
				note: '修課限制：本所、書面選課、實際上課時間及地點請洽授課教師。\n',

				courseAbstract: '',
				courseEngAbstract: '',
				day: '週二',
				mainTeacherName: '',
				dayNum: 2,
				courseLocation: 'F906',
				startPeriod: 1,
				endPeriod: 1,
				startTime: '08:10',
				endTime: '09:00',
			},
			{
				semester: 1142,
				department: '四年制生死與健康心理諮商系',
				courseType: '專業選修(系所)',
				courseFullID: '33140175801110',
				courseName: '身心障礙者特質與發展',
				courseEngName: 'Characteristics and Development of the disabilities',
				departmentID: '33140',
				subjectID: '1758',
				subjectGroup: '01',
				grade: '1',
				classGroup: '10',
				credit: 2,
				className: '生日四技1年10班',
				classID: '33140110',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 20,
				weekNumber: '全18週',
				multipleTeacherName: '葉明理',
				note: '修課限制：本系四技一般生，限55人。',

				courseAbstract:
					'本課程旨在建立學生對身心障礙者身心特質與需求的認識。學生在生理心理學基礎下，進一步認識各類身心障礙的生理與病理成因、障礙模式與需求評估、家庭與社會調適，以及生涯發展與轉銜等議題。課程透過課室講授、案例分析、專題討論等活動，強化學生對身心障礙者的認識，並啟發與此類個案互動及從事此項工作的興趣。',
				courseEngAbstract:
					"This course aims to establish students' understanding of the physical and mental characteristics and needs of the physically and mentally handicapped. On the basis of physiological psychology, students will further understand the physiological and pathological causes of various physical and mental disorders, obstacle models and needs assessment, and issues of family and social adjustment, career development and transfer. Through classroom lectures, case studies, and topic discussions, the course strengthens students’ understanding of the physically and mentally handicapped, and inspires their interest in interacting with such cases and engaging in this work.",
				day: '週三',
				mainTeacherName: '葉明理',
				dayNum: 3,
				courseLocation: 'F414',
				startPeriod: 8,
				endPeriod: 9,
				startTime: '15:40',
				endTime: '17:30',
			},
			{
				semester: 1142,
				department: '四年制生死與健康心理諮商系',
				courseType: '專業選修(系所)',
				courseFullID: '33140097001110',
				courseName: '寬恕教育',
				courseEngName: 'Forgiveness Education',
				departmentID: '33140',
				subjectID: '0970',
				subjectGroup: '01',
				grade: '1',
				classGroup: '10',
				credit: 2,
				className: '生日四技1年10班',
				classID: '33140110',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 54,
				weekNumber: '全18週',
				multipleTeacherName: '吳庶深',
				note: '修課限制：\n1.本系四技一般生、外系二技一般生、外系四技一般生、外系二技進修部。\n3.限65人(含外系5人)。',

				courseAbstract:
					'完美的世界不需要道歉，因為世界是不完美的，所以我們不能沒有道歉。道歉是個人真誠表達認錯與謝罪。真誠的使用道歉的六種語言，可以帶來人際關係的成長，生命中的衝突事件充斥在生命中每個不同的階段、不同的關係與不同的角落中，寬恕是愛護自己、疼惜自己與善待他人的積極選擇。寬恕並不等於和好，寬恕是個人的選擇，放下心中的憤怒及怨恨的情緒，而和好是雙方共同的意願及努力的結果，其中的關鍵因素之一是道歉。如果我們不了解道歉的語言及方法，我們可能永遠不會被真正的原諒，當事人受傷害的關係也可能得不到永遠的修復。\n近年來「寬恕」在諮商領域有廣泛的討論及深入的研究。本課程是寬恕心理學的基礎課程，主要介紹寬恕的內涵及相關研究，內容包含人際關係的衝突與傷害、道歉的重要性、學習道歉的五種語言（表達歉意、承認錯誤、彌補過失、真誠悔改、請求饒恕）、如何進行寬恕教育、如何修復破壞的人際關係、重新展開健康的未來。',
				courseEngAbstract:
					"An apology is a statement with two key elements.: (1) It shows you feel remorse over your actions. (2) Acknowledges the hurt that your actions caused to someone else. Sincere apologies help to rebuild relationships with people you've hurt. That could be colleagues, clients, friends, or family.\n     In the life of many persons, relations between some members of the family get strained and hurted. Forgiveness is a choice and help us to  resolve anger and restore hope. As one forgive , one grows a person capable of courage, nurturance of others, and love. This course will make the students aware that forgiving is a sensible choice, for avoiding our painful living, reducing tension & depression, & restarting dialogue, relationship & a peaceful normal life, by gradual change. \n    Just as we have a different love language, we also hear and express the words and gestures of apology in a different language. Apology is not just a matter of will--it's a matter of how. By helping students identify the languages of apology, this course clears the way toward healing and sustaining vital relationships. We share detail proven techniques for giving and receiving effective apologies.",
				day: '週一',
				mainTeacherName: '吳庶深',
				dayNum: 1,
				courseLocation: 'F414',
				startPeriod: 6,
				endPeriod: 7,
				startTime: '13:40',
				endTime: '15:30',
			},
			{
				semester: 1142,
				department: '四年制生死與健康心理諮商系',
				courseType: '專業選修(系所)',
				courseFullID: '33140122501110',
				courseName: '殯葬禮儀',
				courseEngName: 'Funeral Ceremony',
				departmentID: '33140',
				subjectID: '1225',
				subjectGroup: '01',
				grade: '1',
				classGroup: '10',
				credit: 2,
				className: '生日四技1年10班',
				classID: '33140110',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 45,
				weekNumber: '全18週',
				multipleTeacherName: '陳伯瑋, 翟子睿',
				note: '修課限制：\n1.本系四技一般生、外系二技一般生、外系四技一般生、外系二技進修部、學士後。\n2.限55人(含外系3人)。',

				courseAbstract:
					'本科目之教學設計為縱向整合「殯葬文書」、「臨終關懷及悲傷輔導」與「喪禮善終服務領域」與「殯葬會場規劃與設計」等；橫向銜接「殯葬政策與法規」、「殯葬服務與管理」等課程，期協助學生基本能通過「喪禮服務技術士技能檢定(丙級)」，並朝取得「喪禮服務技術士技能檢定(乙級)」和禮儀師相關證照發展，並具備殯葬管理專長。',
				courseEngAbstract:
					'This course will be based on the historical trajectory of funeral development in China and Taiwan, and explore the reasons and allusions of the cultural formation of the funeral rites. In order to discover the development of such a profound funeral culture in China, the diversity and diversity of ritual customs. In addition to relying on a time-based view of time, the course focuses on the differences in the funeral development of different geographical views. It is conducive to the inclusion of a variety of similar fusion and compound rituals.',
				day: '週二',
				mainTeacherName: '陳伯瑋',
				dayNum: 2,
				courseLocation: 'IB01',
				startPeriod: 3,
				endPeriod: 4,
				startTime: '10:10',
				endTime: '12:00',
			},
			{
				semester: 1142,
				department: '四年制生死與健康心理諮商系',
				courseType: '專業必修(系所)',
				courseFullID: '331401073011A0',
				courseName: '人格心理學',
				courseEngName: 'Personality Psychology',
				departmentID: '33140',
				subjectID: '1073',
				subjectGroup: '01',
				grade: '1',
				classGroup: 'A0',
				credit: 2,
				className: '生日四技1年A0班',
				classID: '331401A0',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '鄧文章',
				note: '修課限制：本系四技一般生',

				courseAbstract:
					'本課程旨在提供學生了解不同的人格基礎理論與相關的部分人格測驗，並且藉由人格理論與方法了解自己的人格及形塑自己性格的各種內、外在因素，進而能推己及人--由了解自己進而去了解他人，奠立未來成為助人工作者之基礎知識背景。',
				courseEngAbstract:
					'This curriculum proposes students can understand basic theories of personality﹐ including personality concepts, formation, influencing factors and assessment tools, but also can apply theories and methods to understand themselves and others. The course emphasizes in utilize different personality theories to formulate personal constructs of personality. This course provides students a well, basic understanding of personality. Therefore, students would have solid knowledge background of counseling and psychotherapy.',
				day: '週四',
				mainTeacherName: '鄧文章',
				dayNum: 4,
				courseLocation: 'G202',
				startPeriod: 6,
				endPeriod: 7,
				startTime: '13:40',
				endTime: '15:30',
			},
			{
				semester: 1142,
				department: '四年制生死與健康心理諮商系',
				courseType: '專業必修(系所)',
				courseFullID: '331401645011A0',
				courseName: '生理心理學',
				courseEngName: 'PHYSIOLOGICAL PSYCHOLOGY',
				departmentID: '33140',
				subjectID: '1645',
				subjectGroup: '01',
				grade: '1',
				classGroup: 'A0',
				credit: 2,
				className: '生日四技1年A0班',
				classID: '331401A0',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '葉明理',
				note: '修課限制：本系四技一般生',

				courseAbstract:
					'本課程將帶領學生由神經生理系統來認識生理與心理活動間相互作用及依存的關係。課程將先認識神經系統與感覺系統，進而探討這些生理系統對肢體活動、睡眠、飲食、生殖、情緒、記憶、溝通、學習等心理或行為的作用與影響，並探討與相關病症或藥物的關係。',
				courseEngAbstract:
					'This course provides an basic understanding of the relationship between human biology and psychology. Students will recognize the nervous and sensory system, and their functions and impacts on physical activities, sleep, diet, sex, emotion, memory, communication and learning behaviors, etc. Students also discuss issues of related illness.',
				day: '週三',
				mainTeacherName: '葉明理',
				dayNum: 3,
				courseLocation: 'F414',
				startPeriod: 6,
				endPeriod: 7,
				startTime: '13:40',
				endTime: '15:30',
			},
			{
				semester: 1142,
				department: '四年制生死與健康心理諮商系',
				courseType: '專業必修(系所)',
				courseFullID: '331400033011A0',
				courseName: '服務學習',
				courseEngName: 'Service Learning',
				departmentID: '33140',
				subjectID: '0033',
				subjectGroup: '01',
				grade: '1',
				classGroup: 'A0',
				credit: 0,
				className: '生日四技1年A0班',
				classID: '331401A0',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '葉明理',
				note: '修課限制：本系四技一般生',

				courseAbstract:
					'本課程設計旨在協助學生培養服務的精神,為了落實課堂所學之服務知識與理念,培養本系學生的社會服務精神,藉由學生至服務機構提供服務,瞭解社會 需求由服務中學習,進而體驗取之於社會用之於社會之意義,培養正向的服務態度, 已達到自我成長與學習自我實現的能力與體驗。',
				courseEngAbstract:
					'This course is designed to help students cultivate the spirit of service, knowledge and ideas in order to implement the service learned in the classroom, the culture of the student community service, by student service organizations to provide services to understand the needs of society to learn from the service, and then experience taken from the social significance of giving back to society, develop a positive attitude, have reached self-growth and self-realization learning ability and experience.',
				day: '週五',
				mainTeacherName: '葉明理',
				dayNum: 5,
				courseLocation: 'F414',
				startPeriod: 5,
				endPeriod: 5,
				startTime: '12:40',
				endTime: '13:30',
			},
			{
				semester: 1142,
				department: '四年制生死與健康心理諮商系',
				courseType: '專業必修(系所)',
				courseFullID: '331400663011A0',
				courseName: '健康社會學',
				courseEngName: 'Sociology of Health and Illness',
				departmentID: '33140',
				subjectID: '0663',
				subjectGroup: '01',
				grade: '1',
				classGroup: 'A0',
				credit: 2,
				className: '生日四技1年A0班',
				classID: '331401A0',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '葉明理',
				note: '修課限制：本系四技一般生',

				courseAbstract:
					'介紹社會學的性質、文化和社會制度、團體與社會組織、醫療權力與知識\n、挑戰醫療霸權、階級與健康、族群與健康、性別與健康、心理健康、信仰、宗教與健康、集體行為與社會運動、身體社會學：慢性病、健康、老化與生命歷程、變動中的國際健康概念、健康社會學分組專題報告等。',
				courseEngAbstract:
					'This course includes such topics as the instruction and development of Sociology, social theories, social research methods, culture, socialization, social interaction, social structure, social groups, formal organization, social stratification, social control, urban life, collective behavior and health, social change.',
				day: '週四',
				mainTeacherName: '葉明理',
				dayNum: 4,
				courseLocation: 'G202',
				startPeriod: 8,
				endPeriod: 9,
				startTime: '15:40',
				endTime: '17:30',
			},
			{
				semester: 1142,
				department: '四年制資訊管理系',
				courseType: '專業必修(系所)',
				courseFullID: '221400118011A0',
				courseName: '多媒體製作與應用',
				courseEngName: 'Production and Application of multimedia',
				departmentID: '22140',
				subjectID: '0118',
				subjectGroup: '01',
				grade: '1',
				classGroup: 'A0',
				credit: 2,
				className: '資日四技1年A0班',
				classID: '221401A0',
				totalOfTakingStudents: null,
				numberOfTakingStudents: 0,
				weekNumber: '全18週',
				multipleTeacherName: '陳裔專',
				note: '修課限制：本系四技一般生、外系四技一般生、本所（研究生下修，不計入畢業學分）',

				courseAbstract:
					'本課程旨在學習超媒體(hypermedia) 的素材製作，包含文案(text)、圖像(image)、語音(audio)、視訊(video)；並教導學生利用各種素材製作、文案編輯、圖像處理、語音合成及視訊剪輯，進而編撰成影音光碟VCD、SVCD、DVD與網路串流。',
				courseEngAbstract:
					'The course provides material source of hypermedia with computer software that includes text clips, image clips, audio clips, and video clips. The learner will integrate these clips to produce VCD, SVCD, DVD medium and steams in the web sites.',
				day: '週三',
				mainTeacherName: '陳裔專',
				dayNum: 3,
				courseLocation: 'F601',
				startPeriod: 5,
				endPeriod: 6,
				startTime: '12:40',
				endTime: '14:30',
			},
		];
		const chunkSize = 3;
		for (let i = 0; i < testValues.length; i += chunkSize) {
			const chunk = testValues.slice(i, i + chunkSize);
			const insertQuery = testDb.insertInto('courses').values(chunk);
			const { sql, parameters } = insertQuery.compile();
			await env.ntunhs_course.batch([env.ntunhs_course.prepare(sql).bind(...parameters)]);
		}
	});

	describe('Course Search API - Basic Parameters', () => {
		// 1. 測試學期過濾 (semester)
		it('應能正確過濾學期 1142', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?semester=1142');
			const body = (await res.json()) as any;
			// 1142 的資料很多，確保回傳的都是 1142
			expect(body.data.every((c: any) => c.semester === 1142)).toBe(true);
			expect(body.data.length).toBeGreaterThan(0);
		});

		// 2. 測試系所代碼 (departmentID)
		it('應能過濾特定系所 (人日碩: 43160)', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?departmentID=43160');
			const body = (await res.json()) as any;
			expect(body.data.every((c: any) => c.departmentID === '43160')).toBe(true);
		});

		// 3. 測試模糊搜尋 (courseName)
		it('應支援課程名稱模糊搜尋 (例如: "大數據")', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?courseName=大數據');
			const body = (await res.json()) as any;
			// 預期會有 "人工智慧與健康大數據研究所" 相關課程或 "健康大數據分析"
			expect(body.data.some((c: any) => c.courseName.includes('大數據'))).toBe(true);
		});

		// 4. 測試星期過濾 (dayNum)
		it('應能過濾星期二的課程 (dayNum=2)', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?dayNum=2');
			const body = (await res.json()) as any;
			expect(body.data.every((c: any) => c.dayNum === 2)).toBe(true);
		});
	});

	describe('Course Search API - Combined Parameters', () => {
		// 組合：學期 + 星期 + 節次
		it('應能搜尋 1142 學期、週二、且在 3-4 節的課程', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?semester=1142&dayNum=2&startPeriod=3&endPeriod=4');
			const body = (await res.json()) as any;
			console.log(body);
			// 預期資料：健康大數據分析 (431601861011A0)
			expect(body.data).toHaveLength(2);
			expect(body.data[0].courseName).toBe('健康大數據分析');
			expect(body.data.every((c: any) => c.dayNum === 2 && c.startPeriod >= 3 && c.endPeriod <= 4)).toBe(true);
		});

		// 組合：系所 + 年級
		it('應能搜尋 生死系 (33140) 的一年級課程', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?departmentID=33140&grade=1');
			const body = (await res.json()) as any;
			expect(body.data.every((c: any) => c.departmentID === '33140' && c.grade === '1')).toBe(true);
		});
	});

	describe('Course Search API - Period Range', () => {
		it('搜尋 startPeriod=6 應包含所有從第 6 節以後開始的課程', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?startPeriod=6');
			const body = (await res.json()) as any;
			expect(body.data.every((c: any) => c.startPeriod >= 6)).toBe(true);
		});

		it('搜尋 endPeriod=4 應包含所有在第 4 節以前結束的課程', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?endPeriod=4');
			const body = (await res.json()) as any;
			expect(body.data.every((c: any) => c.endPeriod <= 4)).toBe(true);
		});

		it('搜尋 5-7 節應精準匹配 "休閒與生活"', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?startPeriod=5&endPeriod=7');
			const body = (await res.json()) as any;
			// 注意：根據您的 Service 邏輯，這是找「完全落在 5-7 區間內」的課程
			expect(body.data.some((c: any) => c.courseName === '休閒與生活')).toBe(true);
		});
	});

	describe('Course Search API - Period Range', () => {
		it('搜尋 startPeriod=6 應包含所有從第 6 節以後開始的課程', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?startPeriod=6');
			const body = (await res.json()) as any;
			expect(body.data.every((c: any) => c.startPeriod >= 6)).toBe(true);
		});

		it('搜尋 endPeriod=4 應包含所有在第 4 節以前結束的課程', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?endPeriod=4');
			const body = (await res.json()) as any;
			expect(body.data.every((c: any) => c.endPeriod <= 4)).toBe(true);
		});

		it('搜尋 5-7 節應精準匹配 "休閒與生活"', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?startPeriod=5&endPeriod=7');
			const body = (await res.json()) as any;

			expect(body.data.every((c: any) => c.startPeriod >= 5 && c.endPeriod <= 7)).toBe(true);
		});
	});

	describe('Course Search API - Pagination', () => {
		it('應能限制回傳筆數 (limit=5)', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?limit=5');
			const body = (await res.json()) as any;
			expect(body.data).toHaveLength(5);
			expect(body.pagination.hasNextPage).toBe(true);
			expect(body.pagination.nextCursor).not.toBeNull();
		});

		it('使用 nextCursor 應能取得下一頁資料', async () => {
			// 第一頁
			const res1 = await SELF.fetch('http://localhost/api/v1/search?limit=2');
			const body1 = (await res1.json()) as any;
			const cursor = body1.pagination.nextCursor;

			// 第二頁
			const res2 = await SELF.fetch(`http://localhost/api/v1/search?limit=2&cursor=${cursor}`);
			const body2 = (await res2.json()) as any;

			expect(body2.data).toHaveLength(2);
			// 確保第二頁的第一筆 ID 大於第一頁的最後一筆 ID (因為我們用 ID 排序)
			expect(body2.data[0].id).toBeGreaterThan(body1.data[1].id);
		});
	});

	describe('Course Search API - Multiple Parameters', () => {
		it('應該支援多個學期查詢 (1122 與 1142)', async () => {
			// 同時查詢兩個學期
			const res = await SELF.fetch('http://localhost/api/v1/search?semester=1122&semester=1142');
			const body = (await res.json()) as any;

			const semesters = body.data.map((c: any) => c.semester);
			expect(semesters).toContain(1122);
			expect(semesters).toContain(1142);
			// 確保沒有其他學期的資料
			expect(body.data.every((c: any) => [1122, 1142].includes(c.semester))).toBe(true);
		});

		it('應該支援多個年級查詢', async () => {
			// 查詢 1 年級和 3 年級
			const res = await SELF.fetch('http://localhost/api/v1/search?grade=1&grade=3');
			const body = (await res.json()) as any;

			expect(body.data.some((c: any) => c.grade === '1')).toBe(true);
			expect(body.data.some((c: any) => c.grade === '3')).toBe(true);
			expect(body.data.every((c: any) => ['1', '3'].includes(c.grade))).toBe(true);
		});

		it('應該支援多個星期查詢 (週一、週二、週五)', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?dayNum=1&dayNum=2&dayNum=5');
			const body = (await res.json()) as any;

			const days = new Set(body.data.map((c: any) => c.dayNum));
			expect(days.has(1)).toBe(true);
			expect(days.has(2)).toBe(true);
			expect(days.has(5)).toBe(true);
			expect(body.data.every((c: any) => [1, 2, 5].includes(c.dayNum))).toBe(true);
		});

		it('應該支援精準多節次查詢 (第一節或第八節)', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?startPeriod=1&startPeriod=8');
			const body = (await res.json()) as any;

			// 預期資料包含：資料探勘 (1節) 和 傳播與生活 (8節)
			const startPeriods = body.data.map((c: any) => c.startPeriod);
			expect(startPeriods).toContain(1);
			expect(startPeriods).toContain(8);
		});

		it('應該支援混合多選項查詢 (1142 學期 且 星期二或星期四)', async () => {
			const res = await SELF.fetch('http://localhost/api/v1/search?semester=1142&dayNum=2&dayNum=4');
			const body = (await res.json()) as any;

			expect(body.data.every((c: any) => c.semester === 1142 && (c.dayNum === 2 || c.dayNum === 4))).toBe(true);
		});
	});
});
