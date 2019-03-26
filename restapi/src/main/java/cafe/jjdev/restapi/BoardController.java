package cafe.jjdev.restapi;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BoardController {
	@Autowired private BoardService boardService;
	//@Controller -> view를 연결
	//@RestController -> 외부에서 함수를 처리(외부에서 list를 호출하면 boarList메서드를 실행)
	
	// 글 리스트
	@GetMapping("/list")
	public List<Board> boardList(){
        System.out.println("(C) boardList() 호출");
        
        List<Board> boardMember = boardService.listBoard();	
        
		return boardMember;
	}
	// 글 생성
	@PostMapping("/add")
	public int addBoard(Board board) {
        System.out.println("(C) addBoard() 호출");
        
        int result = boardService.insertBoard(board);
        
		return result;
	}
	// 글 수정
	@PostMapping("/modifyById")
	public int modifyBoard(Board board) {
        System.out.println("(C) modifyBoard() 호출");
        
        int result = boardService.updateBoard(board);
        
	    return result;
	}
	// 글 삭제
	@GetMapping("/remove") 
	public int removeBoard(@RequestParam("ck[]") int[] ck) {
		System.out.println("(C) removeBoard() 호출");
        
        int result = boardService.deleteBoard(ck);

		return result;
	}
}