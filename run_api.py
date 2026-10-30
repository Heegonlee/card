import os
import json
import requests

def main():
    # 깃허브 환경 변수 및 시크릿에서 안전하게 데이터 추출
    api_key = os.getenv("MONOROUTER_KEY")
    concept = os.getenv("CLIENT_CONCEPT")
    design_type = os.getenv("CLIENT_TYPE")
    
    # 🔗 MonoRouter 공식 규격 통신 엔드포인트 세팅
    base_url = "https://monogpt.kr"
    final_url = f"{base_url}/v1/chat/completions"
    
    system_prompt = """너는 전문 웹 디자이너이자 퍼블리셔야. 사용자가 요구하는 컨셉에 맞춰서 명함 또는 상품소개서 디자인을 완성해야 해.
    ⚠️ 중요 조건:
    1. 마크다운 기호(```html 등)나 설명글을 절대 쓰지 말고 오직 순수한 HTML 코드 하나로만 채워서 답변해줘.
    2. 모든 CSS 스타일은 HTML 태그 내부에 인라인 스타일(style="...")로 작성해줘.
    3. 배경색, 텍스트 배치, 폰트 크기 등을 완벽하고 아름답게 지정해서 바로 인쇄용으로 쓸 수 있게 해줘."""
    
    user_prompt = f"종류: {'명함' if design_type == 'business_card' else '상품소개서'}\n요청내용: {concept}"
    
    # 서버 간 통신이므로 브라우저 CORS 제약을 완벽히 우회합니다.
    res = requests.post(
        final_url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7
        },
        timeout=60
    )
    
    if res.status_code == 200:
        data = res.json()
        ai_html = data["choices"][0]["message"]["content"].strip()
        
        # 깃허브 러너 컴퓨터 안에 임시 파일 생성
        with open("result.html", "w", encoding="utf-8") as f:
            f.write(ai_html)
        print("백엔드: 디자인 HTML 파일 생성 완료")
        
        # 자동 빌드 처리를 위해 깃허브 레포지토리에 커밋 후 강제 업로드 수행
        os.system("git config --global user.name 'github-actions[bot]'")
        os.system("git config --global user.email 'github-actions[bot]@://github.com'")
        os.system("git add result.html")
        os.system("git commit -m 'Deploy AI generated design result'")
        os.system("git push")
        print("백엔드: 생성된 파일 저장소 푸시 및 실시간 배포 트리거 성공")
    else:
        print(f"API 오류 발생: {res.status_code}, {res.text}")

if __name__ == "__main__":
    main()
