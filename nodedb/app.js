// 모듈 가져오기
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const multer = require('multer');
const fs = require('fs');

// myMulter변수에 multer를 이용한 파일 업로드에 대한 설정 선언
const myMulter = multer({
    dest: 'uploads/', 
    limits: { 
        fileSize: 5 * 1024 * 1024
    }
});
// mysql 접속에 필요한 정보 입력
const conn = mysql.createConnection({
    host:'localhost',
    user:'root',    // dbUser
    password :'java0000',   // dbPassword
    database : 'nodedb'  // dbDatabase
});
// 서버 설정 (폴더경로 views로 지정, 뷰 엔진은 ejs로 설정)
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
 
// 정적 미들웨어
// app.use(express.static(__dirname+'/public'));

// public 폴더와 uploads 폴더 오픈
// app.use('/public', static(path.join(__dirname, 'public')));
// app.use('/uploads', static(path.join(__dirname, 'uploads')));

// post 미들웨어
app.use(cookieParser());
app.use(expressSession({  // 해킹을 막고자 비밀키를 설정
    secret : 'happy', // 암호화
    resave : true,  // 저장유무
    saveUninitialized : true  // 속성을 초기화 하지 않고 저장
}));
app.use(bodyParser.urlencoded({extended : true}));

// 라우터 미들웨어
const router = express.Router();
    // 회원 가입폼
    router.get('/memberJoin', (req, res) => {
        console.log('GET : /memberJoin 회원가입폼 요청');
        if(req.session.login_member){
            console.log('현재 로그인 상태입니다.');
            res.redirect('/boardList');
        }else {
            res.render('memberJoin');
        }
    });
    // 회원 가입처리
    router.post('/memberJoin', (req, res) => {
        console.log('POST : /memberJoin 회원가입처리 요청');
        if(req.session.login_member){
            console.log('현재 로그인 상태입니다.');
            res.redirect('/boardList');
        }else {
            // 회원 가입 처리
            // 회원 가입 정보 받아오기
            const member_id = req.body.memberId;
            const member_pw = req.body.memberPw;
            const member_name = req.body.memberName;
            // id 중복 확인
            conn.query('SELECT checked.member_id FROM (SELECT member_id FROM member UNION SELECT member_id FROM memberid)AS checked WHERE checked.member_id=?'
                    ,[member_id], (err, rs) => {
                if(rs[0]) {
                    console.log('중복된 아이디');
                    res.redirect('/memberJoin');
                }else {
                    console.log('아이디가 중복되지 않습니다. 계속 진행');
                    // 회원 가입 처리
                    conn.query('INSERT INTO member(member_id, member_pw, member_name) VALUES(?,?,?)'
                            ,[member_id, member_pw, member_name], (err, rs) => {
                        if(err) {
                            console.log(err)
                            console.log('가입 실패!');
                            res.end();
                        }else {
                            console.log('가입 완료!');
                            res.redirect('/login');
                        }
                    });
                }
            });
        }
    });
    // 회원 탈퇴폼
    router.get('/memberDrop', (req, res) => {
        console.log('GET : /memberDrop 회원탈퇴폼 요청');
        if(!req.session.login_member){
            console.log('현재 로그인 상태가 아닙니다.');
            res.redirect('/login');
        }else {
            res.render('memberDrop');
        }
    });
    // 회원 탈퇴처리
    router.post('/memberDrop', (req, res) => {
        console.log('POST : /memberDrop 회원탈퇴처리 요청');
        if(!req.session.login_member){
            console.log('현재 로그인 상태가 아닙니다.');
            res.redirect('/login');
        }else {
            // 회원 탈퇴 처리 
            // 입력된 비밀번호와 db의 비밀번호 받아오기
            const input_member_pw = req.body.memberPw;
            const db_member_pw = req.session.login_member.member_pw;
            // 탈퇴를 위한 로그인 정보 가져오기
            const member_id = req.session.login_member.member_id;
            // 입력된 비밀번호와 db의 비밀번호가 올바른지 확인
            if(!(input_member_pw == db_member_pw)) {
                console.log('입력된 비밀번호가 올바르지 않습니다.');
                res.render('memberDrop');
            }else {
                // 저장되어 있는 회원 계정 정보 delete
                conn.query('DELETE FROM member WHERE member_id=?'
                        ,[member_id], (err, rs) => {
                    if(err) {
                        console.log(err);
                        res.end();
                    }else {
                        // 삭제된 아이디 중복 가입방지를 위해 회원ID를 memberId 테이블에 insert
                        conn.query('INSERT INTO memberId(member_id, memberId_date) VALUES(?,now())'
                                ,[member_id], (err, rs) => {
                            if(err) {
                                console.log(err);
                                res.end();
                            }else {
                                req.session.destroy();
                                res.redirect('/login');
                            }
                        });
                    }
                });
            }
        }
    });
    // 로그인 폼
    router.get('/login', (req, res) => {
        console.log('GET : /login 폼 요청');
        // 로그인 되어 있지 않다면 ...?
        if(!req.session.login_member){
            res.render('login');
        }else {
            // 로그인 되어 있다면 ...?
            console.log('현재 로그인 상태입니다.');
            res.redirect('/boardList');
        }
    });
    // 로그인 액션
    router.post('/login', (req, res) => {
        const member_id = req.body.memberId;
        const member_pw = req.body.memberPw;
        conn.query('SELECT member_id, member_pw, member_name FROM member WHERE member_id=? AND member_pw=?',
                [member_id, member_pw], (err, rs) => {
                    if(rs.length != 1) {
                        console.log('로그인 실패!');
                        res.redirect('/login');
                    }else {
                        console.log('로그인 성공!');
                        // session에 저장
                        req.session.login_member = {member_id:rs[0].member_id, member_pw:rs[0].member_pw, member_name:rs[0].member_name};
                        console.log('로그인 ID : ' + req.session.login_member.member_id);
                        res.redirect('/boardList');
                    }
                });
    });
    // 로그아웃
    router.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            res.redirect('/login');
        });
    });
    // 입력 요청
    // 입력폼 (GET)
    router.get('/addBoard', (req, res) => {
        console.log('GET : /addBoard 입력폼 요청');
        if(!req.session.login_member) {
            console.log('현재 로그인 상태가 아닙니다.');
            res.redirect('/login');
        }else {
            res.render('addBoard');
        }
    });
    // 입력처리 (POST) (업로드 파일: single(1개))
    router.post('/addBoard', myMulter.single('file'), (req, res) => {
        console.log('POST : /addBoard 입력처리 요청');
        if(!req.session.login_member) {
            console.log('현재 로그인 상태가 아닙니다.');
            res.redirect('/login');
        }else {
            const boardPw = req.body.boardPw;
            const boardTitle = req.body.boardTitle;
            const boardContent = req.body.boardContent;
            const boardUser = req.session.login_member.member_id;
            const boardFile = req.file;
 
            conn.query('INSERT INTO board(board_pw, board_title, board_content, board_user, board_date) VALUES(?,?,?,?,now())'
                    ,[boardPw , boardTitle , boardContent , boardUser], (err, rs) => {
                if(err) {
                    console.log(err);
                    res.end();
                }else {
                    console.log('1. 게시물 INSERT성공');
                    // 게시물 생성후 board no값 가져오기
                    conn.query('SELECT MAX(board_no)AS no FROM board', (err, rs) => {
                        if(err) {
                            console.log(err);
                            res.end();
                        }else {
                            console.log('2. 게시물No SELECT성공');
                            console.log(rs);
                            const boardNo = rs[0].no;
                            // 임의로 생성된 파일이름
                            const boardfileName = boardFile.filename;
                            // 확장자(ext) 추출하기
                            const originalName = boardFile.originalname;
                            const lastIndexOf = originalName.lastIndexOf('.');
                            const boardfileExt = originalName.substring(lastIndexOf+1);
                            // 파일명(원본)
                            const boardfileOriginal = originalName.substring(0,(originalName.indexOf('.')));
                            // 파일 타입
                            const boardfileType = boardFile.mimetype;
                            // 파일 사이즈 
                            const boardfileSize = boardFile.size;
                            conn.query('INSERT INTO boardfile(board_no, boardfile_name, boardfile_original, boardfile_ext, boardfile_type, boardfile_size) VALUES(?,?,?,?,?,?)'
                                    ,[boardNo, boardfileName, boardfileOriginal, boardfileExt, boardfileType, boardfileSize ], (err, rs) => {
                                if(err) {
                                    console.log(err);
                                    res.end();
                                }else {
                                    console.log('3. 게시물 파일 INSERT성공');
                                    res.redirect('/boardList');
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    // 리스트 요청 (메인 페이지) (GET)
    router.get('/boardList', (req, res) => {
        console.log('GET : /boardList 리스트 요청 (메인 페이지)');
        res.redirect('/boardList/1');
    });
    // 리스트 요청 (페이지 이동) (GET)
    router.get('/boardList/:currentPage', (req, res) => {
        console.log('GET : /boardList 리스트 요청 (페이지 이동)');
        let rowPerPage = 10;
        let currentPage = 1;
        if(req.params.currentPage){
            currentPage = parseInt(req.params.currentPage);
        }
        let beginRow = (currentPage-1) * rowPerPage;
        console.log(`currentPage : ${currentPage}`);
        let model = {};
        conn.query('SELECT COUNT(*) AS cnt FROM board', (err, rs) => {
            if(err) {
                console.log(err);
                res.end();
            }else {
                console.log(`totalRow : ${rs[0].cnt}`);
                let totalRow = rs[0].cnt;
                lastPage = totalRow / rowPerPage;
                if(totalRow % rowPerPage != 0) {
                    lastPage++;
                }
            }
            conn.query('SELECT board_no, board_title, board_user FROM board ORDER BY board_no DESC LIMIT ?,?'
                    ,[beginRow,rowPerPage], (err, rs) => {
                if(err) {
                    console.log(err);
                    res.end();
                }else {
                    model.boardList = rs;
                    model.currentPage = currentPage;
                    model.lastPage = Math.floor(lastPage); // Math.floor() : 소수점 버림, 정수 반환
                        // 로그인 상태에 따른 게시판 컬럼 유무 (로그아웃과 회원탈퇴)
                        if(req.session.login_member) {
                            model.loginState = true;
                        }else {
                            model.loginState = false;
                        }
                    console.log('lastPage : ' + model.lastPage);
                    res.render('boardList',{model:model});
                }
            });
        });
    });

    // 게시판 상세내용 (GET)
    router.get('/boardDetail/:board_no', (req, res) => {
        console.log('GET : /boardDetail 상세내용 요청');
        let model = {};
        if(!req.session.login_member) {
            console.log('현재 로그인 상태가 아닙니다.');
            res.redirect('/login');
        }else {
            conn.query('SELECT board_no, board_title, board_content, board_user, board_date FROM board WHERE board_no=?'
                    ,[parseInt(req.params.board_no)], (err, rs) => {
                if(err) {
                    console.log(err);
                    res.end();
                }else {
                    model.board = rs[0];
                    conn.query('SELECT * FROM boardfile WHERE board_no=?'
                            ,[rs[0].board_no], (err, rs) => {
                        if(err) {
                            console.log(err);
                            res.end();
                        }else {
                            model.boardfile = rs[0];
                            res.render('boardDetail', {boardDetail:model});
                        }
                    });
                }
            });
        }
    });

    /* 다운로드 요청 처리 */
    router.get('/download/:fileNo', (req, res) => {
        // 요청시 해당 파일의 id값을 쿼리로 붙여서 전달합니다.(선택된 파일을 DB에서 찾기 위해)
        conn.query('SELECT * FROM boardfile WHERE boardfile_no=?'
                ,[req.params.fileNo], (err, rs) => {
                    if(err) {
                        console.log(err);
                        res.end();
                    }else {
                        let file = {};
                        file.files = rs[0];
                        let filePath = __dirname + "/../nodedb/uploads/" + file.files.boardfile_name; // 다운로드할 파일의 경로​  
                        console.log('경로 설정 완료');
                        let fileName = file.files.boardfile_original; // 원본파일명​
                        // 응답 헤더에 파일의 이름과 mime Type을 명시한다.(한글&특수문자,공백 처리)
                        res.setHeader("Content-Disposition", "attachment;filename=" + encodeURI(fileName) +'.'+file.files.boardfile_ext);
                        res.setHeader("Content-Type","binary/octet-stream");
                        console.log('헤더 설정 완료');
                        // filePath에 있는 파일 스트림 객체를 얻어온다.(바이트 알갱이를 읽어옵니다.)
                        let fileStream = fs.createReadStream(filePath);
                        console.log('파일 스트림 객체 얻기 성공');
                        // 다운로드 한다.(res 객체에 바이트알갱이를 전송한다)
                        fileStream.pipe(res);
                    }
        });
    });

    // 게시판 삭제
    // 삭제폼 (GET)
    router.get('/deleteBoard/:board_no', (req, res) => {
        console.log('GET : /deleteBoard 삭제폼 요청');
        if(!req.session.login_member) {
            console.log('현재 로그인 상태가 아닙니다.');
            res.redirect('/login');
        }else {
            const board_no = parseInt(req.params.board_no);
            console.log(board_no);
            res.render('deleteBoard',{deleteBoard:board_no});
        }
    });
    // 삭제처리 (POST)
    router.post('/deleteBoard', (req, res) => {
        console.log('POST : /deleteBoard 삭제처리');
        if(!req.session.login_member) {
            console.log('현재 로그인 상태가 아닙니다.');
            res.redirect('/login');
        }else {
            const board_no = req.body.board_no;
            const board_pw = req.body.board_pw;
            conn.query('DELETE FROM board WHERE board_no=? AND board_pw=?'
                    ,[board_no, board_pw], (err, rs) => {
                if(err) {
                    console.log(err);
                    res.end();
                }else {
                    res.redirect('/boardList');
                }
            });
        }
    });

    // 게시판 수정
    // 수정폼 (GET)
    router.get('/updateBoard/:board_no', (req, res) => {
        console.log('GET : /updateBoard 수정폼 요청');
        if(!req.session.login_member) {
            console.log('현재 로그인 상태가 아닙니다.');
            res.redirect('/login');
        }else {
            const board_no = parseInt(req.params.board_no);
            console.log('수정할 게시판 No : '+ board_no);
            conn.query('SELECT board_no, board_pw, board_title, board_content, board_user FROM board WHERE board_no=?'
                    ,[board_no], (err, rs) => {
                if(err) {
                    console.log(err);
                    res.end();
                }else {
                    res.render('updateBoard', {updateBoard:rs[0]});
                }
            });
        }
    });
    // 수정처리 (POST)
    router.post('/updateBoard', (req, res) => {
        console.log('POST : /updateBoard 수정처리 요청');
        if(!req.session.login_member) {
            console.log('현재 로그인 상태가 아닙니다.');
            res.redirect('/login');
        }else {
            const board_no = req.body.board_no;
            const board_pw = req.body.board_pw;
            const board_title = req.body.board_title;
            const board_content = req.body.board_content;
            conn.query('UPDATE board SET board_title=?, board_content=? WHERE board_pw=? AND board_no=?'
                    ,[board_title, board_content, board_pw, board_no], (err, rs) => {
                if(err) {
                    console.log(err);
                    res.end();
                }else {
                    res.redirect('/boardList');
                }
            });
        }
    });
// 라우터 객체를 app객체에 등록
app.use('/', router);

// 미들웨어 설정 끝

// 80번포트 웹서버 실행
app.listen(80, () => {
    console.log('80포트로 접속 성공!');
});
