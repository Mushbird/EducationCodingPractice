package cafe.jjdev.restapi;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BoardMapper {

    int insertBoard(Board board);   // 게시글 입력

    int updateBoard(Board board);   // 게시글 수정

    int deleteBoard(int boardNo);   // 게시글 삭제

    List<Board> listBoard();    // 게시글 리스트
}