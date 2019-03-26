<html>
<head>
    <!-- bootstrap을 사용하기 위한 CDN주소 -->
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
    <!-- Latest compiled and minified JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
</head>
<body>
    <div class="container">
        <h1>board_list.php</h1>
        <?php
            // 페이징 작업
            $current_page = 1;
            
            if(isset($_GET["current_page"])){   // isset() 변수안에 값이 세팅이 되어있냐(true) 안되어 있냐(false)
                $current_page = (int)$_GET["current_page"];
            }
            $total_row_count = 0;
            $conn = mysqli_connect('localhost','root','java0000','nodedb');  
            
            $sql1 = "select count(*) as max From board";
            $result1 = mysqli_query($conn,$sql1);   // result1에 만약 성공적이였다면 쿼리의 결과 값(배열)을 가지고 있다.
            
            if($row=mysqli_fetch_array($result1)){  // fetch_array와 arrayList이다. rs.next()와 기능이 같다.
                $total_row_count = $row["max"];
            }
            $page_per_row = 10; // 보여줄 페이지 행의 개수
            $now_page = ($current_page-1)*$page_per_row;
            $sql2 = "select board_no,board_title,board_user,board_date From board ORDER BY board_no DESC LIMIT $now_page,$page_per_row";      
            $result2 = mysqli_query($conn,$sql2);
            
            if($result2){
                echo "select success!";
            }else{
                echo mysqli_error($conn);
            }
        ?>
            <table class="table table-striped">
                <tr>
                    <td>board_no</td>
                    <td>board_title</td>
                    <td>board_user</td>
                    <td>board_date</td>
                </tr>
                <?php
                    while($row=mysqli_fetch_array($result2)) {
                ?>
                        <tr>
                            <td>
                                <?php
                                    echo $row["board_no"];
                                ?>
                            </td>
                            <td>
                                <?php
                                    echo "<a href='/board_detail.php?board_no=".$row["board_no"]."'>";
                                    echo $row["board_title"];
                                    echo "</a>"
                                ?>
                            </td>
                            <td>
                                <?php
                                    echo $row["board_user"];
                                ?>
                            </td>
                            <td>
                                <?php
                                    echo $row["board_date"];
                                ?>
                            </td>
                        </tr>
                <?php
                    }
                ?>
            </table>
            <?php
                $last_page = $total_row_count/$page_per_row;
                if($total_row_count%$page_per_row !=0){
                    $last_page++;
                }
            ?>
            <ul class="pager">
                <?php
                    if($current_page>1){
                ?>
                        <li class="previous"><a href="/board_list.php?current_page=<?php echo $current_page-1?>">이전</a></li>
                <?php        
                    }
                    if($current_page<$last_page){
                ?>
                        <li class="next"><a href="/board_list.php?current_page=<?php echo $current_page+1?>">다음</a></li>
                <?php
                    }
                ?>
                
                
            </ul>
        <div>
            <a class="btn btn-default" href="/board_add_form.php">게시글 입력</a>
        <div>
    </div>
</body>
</html>