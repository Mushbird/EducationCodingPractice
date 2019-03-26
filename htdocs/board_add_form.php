<!-- board_add_form.php -->
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
        integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
        crossorigin="anonymous">
    <title>BOARD ADD</title>
</head>
<body>
    <div class="container">
        <h1>BOARD ADD</h1>
        <form id="addForm" action="/board_add_action.php" method="post">
            <div class="form-group">
                <label for="board_pw">boardPw :</label> 
                <input class="form-control" name="board_pw" id="board_pw" type="password" />
            </div>
            <div class="form-group">
                <label for="board_title">boardTitle :</label> 
                <input class="form-control" name="board_title" id="board_title" type="text" />
            </div>
            <div class="form-group">
                <label for="board_content">boardContent :</label>
                <textarea class="form-control" name="board_content" id="board_content" rows="5" cols="50"></textarea>
            </div>
            <div class="form-group">
                <label for="board_user">boardName :</label> 
                <input class="form-control" name="board_user" id="board_user" type="text" />
            </div>
            <div>
                <input class="btn btn-default" id="addButton" type="submit" value="글입력" /> 
                <input class="btn btn-default" type="reset" value="초기화" /> 
                <a class="btn btn-default" href="/board_list.php">글목록</a>
            </div>
        </form>
    </div>
</body>
</html>