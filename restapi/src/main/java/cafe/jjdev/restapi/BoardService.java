package cafe.jjdev.restapi;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BoardService {
	@Autowired BoardMapper boardMapper;
	// 글 입력
	public int insertBoard(Board board) {
		System.out.println("(S) insertBoard() 호출");
        int result = boardMapper.insertBoard(board);
        System.out.println("(M) insertBoard() 성공");
		return result;
	}
	// 글 수정
	public int updateBoard(Board board) {
        System.out.println("(S) updateBoard() 호출");
        int result = boardMapper.updateBoard(board);
        System.out.println("(M) updateBoard() 성공");
		return result;
	}
	// 글 삭제 
	public int deleteBoard(int[] ck) {
		System.out.println("(S) deleteBoard() 호출");
        int result = 0;
        
		for(int i : ck) {    
            boardMapper.deleteBoard(i);
            result++;
        }
        System.out.println("(M) deleteBoard() 성공");
		return result;
    }
    // 글 리스트
	public List<Board> listBoard() {
        System.out.println("(S) listBoard() 호출");
        List<Board> result = boardMapper.listBoard();
        System.out.println("(M) listBoard() 성공");
		return result;
	}
}